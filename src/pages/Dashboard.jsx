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
        <div className="min-h-screen w-full bg-gray-100 flex justify-center overflow-y-auto py-10">

            {/* CENTRALIZADO */}
            <div className="w-full max-w-md flex flex-col items-center gap-6 mx-auto px-4">

                <h1 className="text-3xl font-bold text-gray-800 text-center w-full">
                    💰 Controle Financeiro
                </h1>

                <button
                    onClick={logout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                    Sair
                </button>

                {/* FORM */}
                <form
                    onSubmit={addOrEditTransaction}
                    className="bg-white p-6 rounded-2xl shadow-md w-full space-y-4 text-center"
                >
                    <h2 className="text-xl font-semibold text-gray-700">
                        {editingId ? "Editar Lançamento" : "Novo Lançamento"}
                    </h2>

                    <input
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Descrição"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />

                    <input
                        type="text"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Valor"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />

                    <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        <option value="expense">Saída</option>
                        <option value="income">Entrada</option>
                    </select>

                    <div className="flex gap-3 justify-center mt-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg transition">
                            {editingId ? "Atualizar" : "Salvar"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-6 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>

                {/* RESUMO */}
                <div className="bg-white p-6 rounded-2xl shadow-md w-full text-center">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Resumo
                    </h2>

                    <p className="text-green-600">
                        Entradas: {formatBRL(income)}
                    </p>
                    <p className="text-red-600">
                        Saídas: {formatBRL(expense)}
                    </p>
                    <p className="font-bold">
                        Saldo: {formatBRL(income - expense)}
                    </p>

                    <div className="flex justify-center mt-4">
                        <PieChart width={240} height={240}>
                            <Pie data={data} dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                                <Cell fill="#22c55e" />
                                <Cell fill="#ef4444" />
                            </Pie>
                            <Tooltip formatter={(v) => formatBRL(v)} />
                        </PieChart>
                    </div>
                </div>

                {/* LISTA */}
                <div className="bg-white p-6 rounded-2xl shadow-md w-full text-center">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">
                        Lançamentos
                    </h2>

                    <div className="space-y-3">
                        {transactions.map((t) => (
                            <div
                                key={t.id}
                                className="bg-gray-50 p-4 rounded-lg flex flex-col items-center"
                            >
                                <p>{t.description}</p>

                                <span className={t.type === "income" ? "text-green-600" : "text-red-600"}>
                                    {formatBRL(Number(t.amount))}
                                </span>

                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => editTransaction(t)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                                    >
                                        Editar
                                    </button>

                                    <button
                                        onClick={() => deleteTransaction(t.id)}
                                        className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm"
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