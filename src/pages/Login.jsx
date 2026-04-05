import { useState } from "react"
import api from "../services/api"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    async function handleLogin(e) {
        e.preventDefault()
        setError("")
        setLoading(true)

        try {
            const res = await api.post("/login", {
                email,
                password
            })

            localStorage.setItem("token", res.data.token)
            localStorage.removeItem("guest")

            // 🔥 garante persistência antes de redirecionar
            setTimeout(() => {
                window.location.href = "/dashboard"
            }, 50)

        } catch (err) {
            const message = err.response?.data?.error

            if (message === "Usuário não encontrado") {
                window.location.href = "/register"
                return
            }

            setError(message || "Erro ao fazer login")
        } finally {
            setLoading(false)
        }
    }

    // 🔥 LOGIN VISITANTE CORRIGIDO
    function handleGuestLogin() {
        try {
            localStorage.setItem("guest", "true")
            localStorage.removeItem("token")

            // 🔥 força salvar antes de sair da página
            setTimeout(() => {
                window.location.href = "/dashboard"
            }, 50)

        } catch (err) {
            console.error("Erro ao entrar como visitante:", err)
        }
    }

    return (
        <div className="center">
            <form onSubmit={handleLogin} className="card w-80">
                <h1 className="title">Login</h1>

                {error && (
                    <p className="text-red-600 text-sm mb-2">{error}</p>
                )}

                <input
                    className="input"
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />

                <div style={{ position: "relative" }}>
                    <input
                        type={showPassword ? "text" : "password"}
                        className="input"
                        placeholder="Senha"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />

                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: "absolute",
                            right: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            cursor: "pointer",
                            fontSize: "14px"
                        }}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </span>
                </div>

                <button className="btn" disabled={loading}>
                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                            <div className="spinner"></div>
                            Carregando...
                        </div>
                    ) : (
                        "Entrar"
                    )}
                </button>

                {/* 🔥 BOTÃO VISITANTE */}
                <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="btn"
                    style={{ marginTop: "10px", background: "#eee", color: "#000" }}
                >
                    Entrar como visitante
                </button>
            </form>

            <style>
                {`
                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #ccc;
                    border-top: 2px solid #000;
                    border-radius: 50%;
                    animation: spin 0.6s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                `}
            </style>
        </div>
    )
}