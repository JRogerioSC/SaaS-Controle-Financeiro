import { useEffect, useState } from "react"
import api from "../services/api"
import { PieChart, Pie, Cell, Tooltip } from "recharts"

export default function Dashboard() {
    const [transactions, setTransactions] = useState([])
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [type, setType] = useState("expense")
    const [editingId, setEditingId] = useState(null)

    // ===============================
    // Utils
    // ===============================
    function normalizeAmount(value) {
        return Number(String(value).replace(",", "."))
    }

    function formatBRL(value) {
        return value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
    }

    // ===============================
    // API
    // ===============================
    async function loadTransactions() {
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

        if (editingId) {
            await api.put(`/transactions/${editingId}`, payload)
        } else {
            await api.post("/transactions", payload)
        }

        resetForm()
        loadTransactions()
    }

    async function deleteTransaction(id) {
        if (!window.confirm("Deseja excluir este lançamento?")) return
        await api.delete(`/transactions/${id}`)
        loadTransactions()
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
        window.location.href = "/login"
    }


    useEffect(() => {
        loadTransactions()
    }, [])

    // ===============================
    // Cálculos
    // ===============================
    const income = transactions
        .filter(t => t.type === "income")
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const expense = transactions
        .filter(t => t.type === "expense")
        .reduce((acc, t) => acc + Number(t.amount), 0)

    const data = [
        { name: "Entradas", value: income },
        { name: "Saídas", value: expense }
    ]

    // ===============================
    // JSX
    // ===============================
    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Controle Financeiro</h1>
                <button onClick={logout} className="btn bg-red-600">
                    Sair
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <form onSubmit={addOrEditTransaction} className="card">
                    <h2 className="title">
                        {editingId ? "Editar Lançamento" : "Novo Lançamento"}
                    </h2>

                    <input
                        className="input"
                        placeholder="Descrição"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        className="input"
                        placeholder="Valor (ex: 1200 ou 1200,50)"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        required
                    />

                    <select
                        className="input"
                        value={type}
                        onChange={e => setType(e.target.value)}
                    >
                        <option value="expense">Saída</option>
                        <option value="income">Entrada</option>
                    </select>

                    <div className="flex gap-2">
                        <button className="btn flex-1">
                            {editingId ? "Atualizar" : "Salvar"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="btn bg-gray-500 flex-1"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>

                <div className="card flex flex-col items-center">
                    <h2 className="title">Resumo</h2>

                    <p className="text-green-600">
                        Entradas: {formatBRL(income)}
                    </p>

                    <p className="text-red-600">
                        Saídas: {formatBRL(expense)}
                    </p>

                    <p className="font-bold mb-4">
                        Saldo: {formatBRL(income - expense)}
                    </p>

                    <PieChart width={240} height={240}>
                        <Pie
                            data={data}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label
                        >
                            <Cell fill="#22c55e" />
                            <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip formatter={(v) => formatBRL(v)} />
                    </PieChart>
                </div>
            </div>

            <div className="card mt-6">
                <h2 className="title">Lançamentos</h2>

                {transactions.map(t => (
                    <div
                        key={t.id}
                        className="flex justify-between items-center border-b py-2"
                    >
                        <div>
                            <p>{t.description}</p>
                            <span
                                className={
                                    t.type === "income"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }
                            >
                                {formatBRL(Number(t.amount))}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => editTransaction(t)}
                                className="btn bg-blue-600"
                            >
                                Editar
                            </button>

                            <button
                                onClick={() => deleteTransaction(t.id)}
                                className="btn bg-red-600"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

