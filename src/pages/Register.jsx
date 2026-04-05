import { useState } from "react"
import api from "../services/api"

export default function Register() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    async function handleRegister(e) {
        e.preventDefault()
        setError("")

        try {
            await api.post("/register", {
                name,
                email,
                password
            })

            // 🔥 limpa qualquer estado antes de ir pro login
            localStorage.removeItem("token")
            localStorage.removeItem("guest")

            window.location.href = "/login"

        } catch (err) {
            setError(err.response?.data?.error || "Erro ao cadastrar")
        }
    }

    function goToLogin() {
        window.location.href = "/login"
    }

    return (
        <div className="center">
            <form onSubmit={handleRegister} className="card w-80">
                <h1 className="title">Cadastro</h1>

                {error && (
                    <p className="text-red-600 text-sm mb-2">{error}</p>
                )}

                <input
                    className="input"
                    placeholder="Nome"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />

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

                <button className="btn mb-2">Cadastrar</button>

                <button
                    type="button"
                    onClick={goToLogin}
                    className="btn bg-gray-500 w-full"
                >
                    Já tenho conta · Login
                </button>
            </form>
        </div>
    )
}