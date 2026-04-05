import { useEffect, useState } from "react"
import api from "../services/api"
import { PieChart, Pie, Cell, Tooltip } from "recharts"

export default function Dashboard() {
    const [transactions, setTransactions] = useState([])
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [type, setType] = useState("expense")
    const [editingId, setEditingId] = useState(null)

    const [isGuest, setIsGuest] = useState(false)

    function normalizeAmount(value) {
        return Number(String(value).replace(",", "."))
    }

    function formatBRL(value) {
        return Number(value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })
    }

    async function loadTransactions(guestParam) {
        const guest = guestParam ?? (localStorage.getItem("guest") === "true")

        if (guest) {
            const data = JSON.parse(localStorage.getItem("guest_transactions") || "[]")
            setTransactions(data)
            return
        }

        const res = await api.get("/transactions")
        setTransactions(res.data)
    }

    async function addOrEditTransaction(e) {
        e.preventDefault()

        const payload = {
            description,
            amount: normalizeAmount(amount),
            type
        }

        if (isGuest) {
            let data = JSON.parse(localStorage.getItem("guest_transactions") || "[]")

            if (editingId) {
                data = data.map(t =>
                    t.id === editingId ? { ...t, ...payload } : t
                )
            } else {
                const newTransaction = {
                    id: Date.now(),
                    ...payload
                }
                data.push(newTransaction)
            }

            localStorage.setItem("guest_transactions", JSON.stringify(data))
        } else {
            if (editingId) {
                await api.put(`/transactions/${editingId}`, payload)
            } else {
                await api.post("/transactions", payload)
            }
        }

        resetForm()
        loadTransactions(isGuest)
    }

    async function deleteTransaction(id) {
        if (!window.confirm("Deseja excluir este lançamento?")) return

        if (isGuest) {
            let data = JSON.parse(localStorage.getItem("guest_transactions") || "[]")
            data = data.filter(t => t.id !== id)
            localStorage.setItem("guest_transactions", JSON.stringify(data))
        } else {
            await api.delete(`/transactions/${id}`)
        }

        loadTransactions(isGuest)
    }

    function editTransaction(t) {
        setEditingId(t.id)
        setDescription(t.description)
        setAmount(String(t.amount))
        setType(t.type)
    }

    function resetForm() {
        setEditingId(null)
        setDescription("")
        setAmount("")
        setType("expense")
    }

    function logout() {
        localStorage.removeItem("token")
        localStorage.removeItem("guest")
        window.location.href = "/login"
    }

    useEffect(() => {
        const guest = localStorage.getItem("guest") === "true"

        setIsGuest(guest)

        // 🔥 garante leitura correta mesmo em navegação rápida
        setTimeout(() => {
            loadTransactions(guest)
        }, 0)

    }, [])

    const income = transactions
        .filter((t) => t.type === "income")
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const expense = transactions
        .filter((t) => t.type === "expense")
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const data = [
        { name: "Entradas", value: income },
        { name: "Saídas", value: expense },
    ]

    return (
        <div className="dashboard">

            <button onClick={logout} className="logout-btn">
                Sair
            </button>

            <div className="container">

                <h1 className="page-title">💰 Financeiro</h1>

                {isGuest && (
                    <p style={{ color: "orange", fontSize: "14px" }}>
                        Modo visitante (dados não são salvos na conta)
                    </p>
                )}

                <div className="summary-card">
                    <p>Saldo atual</p>
                    <h2>{formatBRL(income - expense)}</h2>

                    <div className="summary-values">
                        <span>{formatBRL(income)}</span>
                        <span>{formatBRL(expense)}</span>
                    </div>
                </div>

                <form onSubmit={addOrEditTransaction} className="form-card">

                    <h2>{editingId ? "Editar" : "Novo lançamento"}</h2>

                    <input
                        className="input"
                        placeholder="Descrição"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />

                    <input
                        className="input"
                        placeholder="Valor"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />

                    <select
                        className="input"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="expense">Saída</option>
                        <option value="income">Entrada</option>
                    </select>

                    <div className="button-group">
                        <button className="btn">
                            {editingId ? "Atualizar" : "Salvar"}
                        </button>

                        {editingId && (
                            <button type="button" onClick={resetForm} className="btn secondary">
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>

                <div className="chart-card">
                    <PieChart width={220} height={220}>
                        <Pie data={data} dataKey="value" outerRadius={80}>
                            <Cell fill="#22c55e" />
                            <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip formatter={(v) => formatBRL(v)} />
                    </PieChart>
                </div>

                <div className="list-card">
                    <h2>Lançamentos</h2>

                    {transactions.map((t) => (
                        <div key={t.id} className="transaction">

                            <div>
                                <p>{t.description}</p>
                                <span>
                                    {formatBRL(Number(t.amount))} • {t.type === "income" ? "Entrada" : "Saída"}
                                </span>
                            </div>

                            <div className="actions">
                                <button onClick={() => editTransaction(t)}>Editar</button>
                                <button onClick={() => deleteTransaction(t.id)}>Excluir</button>
                            </div>

                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}