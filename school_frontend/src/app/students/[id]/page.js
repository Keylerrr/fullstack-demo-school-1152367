"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftIcon } from "lucide-react";

const API_BASE_URL = "http://localhost:8000";

export default function StudentDetail() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/students/${params.id}/`);
        if (!res.ok) throw new Error("Estudiante no encontrado");
        const data = await res.json();
        setStudent(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, [params.id]);

  if (loading) return <div>Cargando...</div>;
  if (!student) return <div>Estudiante no encontrado</div>;

  return (
    <div className="container mx-auto p-4">
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Volver al listado
      </Button>

      <Card className="w-96 mx-auto">
        <CardHeader>
          <CardTitle>Detalle del Estudiante</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Nombre completo</label>
            <p className="text-lg">{student.full_name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg">{student.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Código</label>
            <p className="text-lg">{student.code}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">ID</label>
            <p className="text-lg">{student.id}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}