import { useState } from "react"
import api from "../services/api"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    async function handleLogin(e) {
        e.preventDefault()
        setError("")

        try {
            const res = await api.post("/login", {
                email,
                password
            })

            localStorage.setItem("token", res.data.token)

            // login OK → dashboard
            window.location.href = "/dashboard"

        } catch (err) {
            const message = err.response?.data?.error

            // 👉 usuário não existe → cadastro
            if (message === "Usuário não encontrado") {
                window.location.href = "/register"
                return
            }

            // outros erros (senha errada, etc)
            setError(message || "Erro ao fazer login")
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

                <input
                    type="password"
                    className="input"
                    placeholder="Senha"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />

                <button className="btn">Entrar</button>
            </form>
        </div>
    )
}
