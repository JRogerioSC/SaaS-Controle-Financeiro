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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

            <div className="w-full max-w-5xl">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        💰 Controle Financeiro
                    </h1>

                    <button
                        onClick={logout}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                    >
                        Sair
                    </button>
                </div>

                {/* GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* FORM */}
                    <form
                        onSubmit={addOrEditTransaction}
                        className="bg-white p-6 rounded-2xl shadow-md space-y-4"
                    >
                        <h2 className="text-xl font-semibold text-gray-700">
                            {editingId ? "Editar Lançamento" : "Novo Lançamento"}
                        </h2>

                        <input
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Descrição"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />

                        <input
                            type="text"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Valor (ex: 1200 ou 1200,50)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                        />

                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="expense">Saída</option>
                            <option value="income">Entrada</option>
                        </select>

                        <div className="flex gap-3">
                            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition">
                                {editingId ? "Atualizar" : "Salvar"}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white py-2 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>

                    {/* RESUMO */}
                    <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col items-center">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">
                            Resumo
                        </h2>

                        <div className="space-y-1 text-center mb-4">
                            <p className="text-green-600 font-medium">
                                Entradas: {formatBRL(income)}
                            </p>

                            <p className="text-red-600 font-medium">
                                Saídas: {formatBRL(expense)}
                            </p>

                            <p className="text-lg font-bold text-gray-800">
                                Saldo: {formatBRL(income - expense)}
                            </p>
                        </div>

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

                {/* LISTA */}
                <div className="bg-white p-6 rounded-2xl shadow-md mt-8">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Lançamentos
                    </h2>

                    <div className="space-y-3">
                        {transactions.map((t) => (
                            <div
                                key={t.id}
                                className="flex justify-between items-center bg-gray-50 p-4 rounded-lg hover:shadow-sm transition"
                            >
                                <div>
                                    <p className="font-medium text-gray-800">
                                        {t.description}
                                    </p>

                                    <span
                                        className={
                                            t.type === "income"
                                                ? "text-green-600 font-semibold"
                                                : "text-red-600 font-semibold"
                                        }
                                    >
                                        {formatBRL(Number(t.amount))}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => editTransaction(t)}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition"
                                    >
                                        Editar
                                    </button>

                                    <button
                                        onClick={() => deleteTransaction(t.id)}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    )
}