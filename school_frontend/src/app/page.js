
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { set, useForm } from "react-hook-form"
import { toast } from "sonner"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { useRouter } from "next/navigation";

const API_BASE_URL = "http://localhost:8000";


export default function Home() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm()
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [ordering, setOrdering] = useState("full_name")
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
    currentPage: 1
  });
  const router = useRouter();

  const loadStudents = async (pageUrl = null) => {
    let url;
    if (pageUrl) {
      url = pageUrl;
    } else {
      url = `${API_BASE_URL}/students/?search=${query}&ordering=${ordering}`;
    }
    const res = await fetch(url);
    const data = await res.json();
    setStudents(data.results);
    setPagination({
      count: data.count,
      next: data.next,
      previous: data.previous,
      currentPage: getCurrentPage(data.next, data.previous)
    });
  }

  const getCurrentPage = (nextUrl, previousUrl, currentUrl = null) => {
    try {
      if (currentUrl) {
        const url = new URL(currentUrl);
        const page = url.searchParams.get('page');
        return parseInt(page || '1');
      }

      if (previousUrl) {
        const url = new URL(previousUrl);
        const page = url.searchParams.get('page');
        return parseInt(page || '1') + 1;
      }
      
      if (nextUrl) {
        const url = new URL(nextUrl);
        const page = url.searchParams.get('page');
        const nextPage = parseInt(page || '2');
        return Math.max(1, nextPage - 1);
      }
      
      return 1;
    } catch (error) {
      console.error("Error calculando página:", error);
      return 1;
    }
  };

  const handleNextPage = () => {
    if (pagination.next) {
      loadStudents(pagination.next);
    }
  };

  const handlePreviousPage = () => {
    if (pagination.previous) {
      loadStudents(pagination.previous);
    }
  };

  const orderingClickHandler = (button) => {
    if (button === 'name_button') {
      if (ordering === 'full_name') setOrdering('-full_name')
      else setOrdering('full_name')
    } else {
      if (ordering === 'code') setOrdering('-code')
      else setOrdering('code')
    }
  }

  useEffect(() => {
    loadStudents();
  }, [query, ordering]);

  const onSubmit = async (data) => {
    console.log("Submitting data: ", data);
    const response = await fetch(`${API_BASE_URL}/students/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
    )
    if (response.ok) {
      const newStudent = await response.json();
      loadStudents();
      
      reset();
      setDialogOpen(false);

      toast.success("Estudiante agregado con éxito");
    }
    else {
      const errorData = await response.json();
      console.error("Error adding student: ", errorData);

      let errorMessage = "";

      for(const key in errorData) {
        errorMessage += `${key}: ${errorData[key]}\n`;
      }

      toast.error("Error al agregar el estudiante", {
        description: errorMessage,
      });
    }
  }

  return (
    <Card className="w-96 mx-auto mt-4">
      <CardHeader>
        <CardTitle>Students</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Input placeholder="Buscar..." value={query} onChange={(e) => setQuery(e.target.value)} />
          <Button variant="outline" onClick={() => { orderingClickHandler("name_button") }}>
            {ordering === 'full_name' ? <ArrowDownIcon /> : <ArrowUpIcon />}
          </Button>
          <Button variant="outline" onClick={() => { orderingClickHandler("code_button") }}>
            {ordering === 'code' ? <ArrowDownIcon /> : <ArrowUpIcon />}
          </Button>
        </div>
        <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700"></hr>

        <div className="p-4 h-96 overflow-y-auto">
          <ul>
            {students.map((student) => (
              <li key={student.code} className="text-md font-medium my-2 flex flex-row justify-between items-center p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
              title={student.email}
              onClick={() => router.push(`/students/${student.id}`)}>
                <div>
                  {student.full_name}

                </div>
                <div>
                  {student.code}
                </div>
              </li>
            ))}
          </ul>
        </div>
        <hr className="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700"></hr>

        <div className="flex justify-center mt-4 mb-4">
          <Pagination>
            <PaginationContent>

              <PaginationItem>
                <PaginationPrevious 
                  onClick={handlePreviousPage}
                  className={!pagination.previous ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              <PaginationItem>
                <div className="px-4 py-2 text-sm">
                  Página {pagination.currentPage} de {Math.ceil(pagination.count / 5)}
                </div>
              </PaginationItem>

              <PaginationItem>
                <PaginationNext 
                  onClick={handleNextPage}
                  className={!pagination.next ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

            </PaginationContent>
          </Pagination>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Crear Estudiante</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Estudiante</DialogTitle>
              </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Field className="mt-4">
                  <FieldLabel htmlFor="full_name" >Nombre completo</FieldLabel>
                  <Input id="full_name" placeholder="Ingresa el nombre" {...register("full_name", { required: true })}></Input>
                </Field>
                <Field className="mt-4">
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input id="email" placeholder="Ingresa el email" {...register("email", { required: true })}></Input>
                </Field>
                <Field className="mt-4 mb-6">
                  <FieldLabel htmlFor="code">Código</FieldLabel>
                  <Input id="code" placeholder="Ingresa el código" {...register("code", { required: true })}></Input>
                </Field>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancelar</Button>
                </DialogClose>
                <Button type="submit">Agregar</Button>
              </DialogFooter>
          </form>
            </DialogContent>
        </Dialog>

      </CardContent>
    </Card>

  );
}