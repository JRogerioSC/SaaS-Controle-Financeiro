import { useEffect, useState } from "react"
import api from "../services/api"
import { PieChart, Pie, Cell, Tooltip } from "recharts"

export default function Dashboard() {
    const [transactions, setTransactions] = useState([])
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [type, setType] = useState("expense")
    const [editingId, setEditingId] = useState(null)

    function normalizeAmount(value) {
        return Number(String(value).replace(",", "."))
    }

    function formatBRL(value) {
        return Number(value).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })
    }

    async function loadTransactions() {
        const res = await api.get("/transactions")
        setTransactions(res.data)
    }

    async function addOrEditTransaction(e) {
        e.preventDefault()

        const payload = {
            description,
            amount: normalizeAmount(amount),
            type,
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
        <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-3 relative">

            {/* BOTÃO SAIR AGORA À ESQUERDA */}
            <button
                onClick={logout}
                className="fixed top-4 left-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg z-50"
            >
                Sair
            </button>

            <div className="w-full max-w-lg space-y-8">

                <h1 className="text-2xl font-bold text-gray-800 text-center">
                    💰 Financeiro
                </h1>

                {/* RESUMO */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-2xl shadow-lg">
                    <p className="text-sm opacity-80 mb-1">Saldo atual</p>
                    <h2 className="text-2xl font-bold">
                        {formatBRL(income - expense)}
                    </h2>

                    <div className="flex justify-between mt-5 text-sm">
                        <span>🟢 {formatBRL(income)}</span>
                        <span>🔴 {formatBRL(expense)}</span>
                    </div>
                </div>

                {/* FORM */}
                <form
                    onSubmit={addOrEditTransaction}
                    className="bg-white p-6 rounded-2xl shadow space-y-5"
                >
                    <h2 className="font-semibold text-gray-700">
                        {editingId ? "Editar" : "Novo lançamento"}
                    </h2>

                    {/* INPUTS COM MAIS ESPAÇO */}
                    <div className="space-y-4">
                        <input
                            className="w-full border rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500"
                            placeholder="Descrição"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />

                        <input
                            className="w-full border rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500"
                            placeholder="Valor"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />

                        <select
                            className="w-full border rounded-lg px-3 py-3"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="expense">Saída</option>
                            <option value="income">Entrada</option>
                        </select>
                    </div>

                    {/* BOTÕES COM MAIS ESPAÇO */}
                    <div className="flex gap-5 pt-3">
                        <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                            {editingId ? "Atualizar" : "Salvar"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 bg-gray-400 text-white py-3 rounded-lg"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>

                {/* GRÁFICO */}
                <div className="bg-white p-6 rounded-2xl shadow flex justify-center">
                    <PieChart width={220} height={220}>
                        <Pie data={data} dataKey="value" outerRadius={80}>
                            <Cell fill="#22c55e" />
                            <Cell fill="#ef4444" />
                        </Pie>
                        <Tooltip formatter={(v) => formatBRL(v)} />
                    </PieChart>
                </div>

                {/* LISTA */}
                <div className="bg-white p-6 rounded-2xl shadow space-y-5">
                    <h2 className="font-semibold text-gray-700">
                        Lançamentos
                    </h2>

                    {transactions.map((t) => (
                        <div
                            key={t.id}
                            className="flex justify-between items-center bg-gray-50 p-4 rounded-lg"
                        >
                            <div>
                                <p className="text-sm font-medium">
                                    {t.description}
                                </p>
                                <span className="text-sm text-gray-700">
                                    {formatBRL(Number(t.amount))} • {t.type === "income" ? "Entrada" : "Saída"}
                                </span>
                            </div>

                            {/* BOTÕES MAIS ESPAÇADOS */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => editTransaction(t)}
                                    className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs"
                                >
                                    Editar
                                </button>

                                <button
                                    onClick={() => deleteTransaction(t.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    )
}