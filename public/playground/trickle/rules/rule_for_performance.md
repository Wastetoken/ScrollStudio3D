When developing canvas animations
- NEVER use getImageData/putImageData for per-pixel manipulation on large canvases - causes severe lag
- Keep pixel processing steps large (8+ pixels) if absolutely needed
- Prefer canvas drawing operations (gradients, shapes) over pixel manipulation
- Limit trail lengths to 15-20 points max
- Use requestAnimationFrame, not setInterval
- Clear canvas with clearRect, not fillRect when possible
- Keep FBM/noise calculations minimal or pre-computed