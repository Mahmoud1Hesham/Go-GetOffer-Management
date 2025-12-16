// Minimal inline toast fallback when Sonner isn't visible
export function showSimpleToast(message, { duration = 3000, type = 'info' } = {}) {
  try {
    const id = '__simple_toast__'
    let container = document.getElementById(id)
    if (!container) {
      container = document.createElement('div')
      container.id = id
      Object.assign(container.style, {
        position: 'fixed',
        right: '1rem',
        bottom: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        zIndex: 999999,
        pointerEvents: 'none'
      })
      document.body.appendChild(container)
    }

    const toast = document.createElement('div')
    toast.textContent = message
    toast.setAttribute('role', 'status')
    Object.assign(toast.style, {
      pointerEvents: 'auto',
      background: type === 'error' ? '#fee2e2' : '#ecfeff',
      color: '#062024',
      padding: '0.5rem 0.75rem',
      borderRadius: '6px',
      boxShadow: '0 6px 18px rgba(2,6,23,0.08)',
      fontSize: '0.95rem',
      maxWidth: '320px',
      border: '1px solid rgba(2,6,23,0.06)'
    })

    container.appendChild(toast)

    setTimeout(() => {
      toast.style.transition = 'opacity 240ms ease, transform 240ms ease'
      toast.style.opacity = '0'
      toast.style.transform = 'translateY(8px)'
    }, Math.max(50, duration - 240))

    setTimeout(() => {
      try { container.removeChild(toast) } catch (e) {}
    }, duration)

    return () => { try { container.removeChild(toast) } catch (e) {} }
  } catch (err) {
    try { console.warn('simpleToast error', err) } catch (e) {}
  }
}

export default showSimpleToast
