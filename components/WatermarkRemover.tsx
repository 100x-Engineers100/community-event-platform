'use client'

import { useEffect } from 'react'

export function WatermarkRemover() {
    useEffect(() => {
        // Helper to traverse all nodes including open shadow roots
        const getAllNodes = (root: Node): Node[] => {
            const nodes: Node[] = []
            const walker = document.createTreeWalker(
                root,
                NodeFilter.SHOW_ELEMENT,
                null
            )

            let node = walker.nextNode()
            while (node) {
                nodes.push(node)
                if (node instanceof Element && node.shadowRoot) {
                    nodes.push(...getAllNodes(node.shadowRoot))
                }
                node = walker.nextNode()
            }
            return nodes
        }

        const removeWatermark = () => {
            try {
                // 1. Traverse everything (Main DOM + Shadow DOMs)
                const allNodes = getAllNodes(document.body)

                allNodes.forEach(node => {
                    if (!(node instanceof Element)) return

                    // Strategy A: Check 'href' if it's an anchor
                    if (node.tagName === 'A') {
                        const href = node.getAttribute('href') || ''
                        if (href.includes('unicorn.studio') || href.includes('unicornstudio')) {
                            node.remove() // Nuke it
                            return
                        }
                    }

                    // Strategy B: Check specific classes usually used by Unicorn Studio
                    if (
                        node.classList.contains('us-watermark') ||
                        node.getAttribute('data-us-project')
                    ) {
                        // Check children for the link
                        const links = node.querySelectorAll('a')
                        links.forEach(l => {
                            if (l.href.includes('unicorn')) l.remove()
                        })
                    }

                    // Strategy C: Text Content Check (Last Resort, be careful not to delete user content)
                    // We look for small text "Made with Unicorn Studio" usually at the bottom
                    const text = node.textContent?.toLowerCase() || ''
                    if (
                        (text.includes('made with unicorn studio') || text.includes('unicorn studio')) &&
                        node.tagName === 'A' // Use safer check: usually it's a link
                    ) {
                        node.remove()
                    }
                })

            } catch (e) {
                // Ignore errors during removal
            }
        }

        // Run extremely aggressively at start
        const intervalId = setInterval(removeWatermark, 100)

        // Also use observer for immediate reaction on the body
        const observer = new MutationObserver(() => {
            removeWatermark()
        })

        if (typeof document !== 'undefined') {
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true // Watch for attribute changes too
            })
        }

        // Keep checking for a longer duration to catch delayed script loads
        // Unicorn studio script might load async
        const timeoutId = setTimeout(() => {
            clearInterval(intervalId)
        }, 10000) // 10 seconds of aggressive checking

        return () => {
            clearInterval(intervalId)
            clearTimeout(timeoutId)
            observer.disconnect()
        }
    }, [])

    return null
}
