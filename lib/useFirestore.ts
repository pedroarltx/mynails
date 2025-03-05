"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, type DocumentData } from "firebase/firestore"
import { db } from "./firebase"

export function useFirestore<T extends DocumentData>(collectionName: string) {
  const [documents, setDocuments] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, collectionName))
        const querySnapshot = await getDocs(q)
        const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as unknown as T)
        setDocuments(docs)
        setLoading(false)
      } catch (err) {
        setError("Erro ao buscar documentos")
        setLoading(false)
      }
    }

    fetchData()
  }, [collectionName])

  const addDocument = async (data: Omit<T, "id">) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data)
      setDocuments((prev) => [...prev, { id: docRef.id, ...data } as unknown as T])
    } catch (err) {
      setError("Erro ao adicionar documento")
    }
  }

  const updateDocument = async (id: string, data: Partial<T>) => {
    try {
      await updateDoc(doc(db, collectionName, id), data)
      setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, ...data } : doc)))
    } catch (err) {
      setError("Erro ao atualizar documento")
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id))
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
    } catch (err) {
      setError("Erro ao excluir documento")
    }
  }

  return { documents, loading, error, addDocument, updateDocument, deleteDocument }
}

