"use client";

import {
    Accordion,
    AccordionItem,
    Button,
    Card,
    CardBody,
    Chip,
    Checkbox,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    useDisclosure,
} from "@heroui/react";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiUsers } from "react-icons/fi";

type Schedule = {
    id: number;
    clientId: string;
    clientName: string;
    service: string;
    startDate: string;
    endDate: string;
    monday: number | null;
    tuesday: number | null;
    wednesday: number | null;
    thursday: number | null;
    friday: number | null;
    saturday: number | null;
    sunday: number | null;
    multiple: boolean | null;
};

type UpsertForm = {
    id?: number;
    clientId: string;
    clientName: string;
    service: string;
    startDate: string; // yyyy-mm-dd
    endDate: string; // yyyy-mm-dd
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
    multiple?: boolean;
};

function toDateInputValue(dateLike: string | Date): string {
    const d = new Date(dateLike);
    const tzOffset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - tzOffset * 60 * 1000);
    return local.toISOString().slice(0, 10);
}

export default function SchedulesManager() {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [creating, setCreating] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [removing, setRemoving] = useState(false);

    // Modals
    const createDisclosure = useDisclosure();
    const editDisclosure = useDisclosure();
    const deleteDisclosure = useDisclosure();

    const [activeClient, setActiveClient] = useState<{
        id: string;
        name: string;
    } | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_activeClient, _setActiveClient] = useState(activeClient);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_editTarget, setEditTarget] = useState<Schedule | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Schedule | null>(null);

    const emptyForm: UpsertForm = {
        clientId: "",
        clientName: "",
        service: "",
        startDate: "",
        endDate: "",
        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
        saturday: "",
        sunday: "",
        multiple: false,
    };

    const [form, setForm] = useState<UpsertForm>(emptyForm);

    const groupedByClient = useMemo(() => {
        const map = new Map<string, { name: string; schedules: Schedule[] }>();
        for (const s of schedules) {
            const key = s.clientId;
            const current = map.get(key);
            if (current) {
                current.schedules.push(s);
            } else {
                map.set(key, { name: s.clientName, schedules: [s] });
            }
        }
        return map;
    }, [schedules]);

    const distinctClients = useMemo(() => {
        return Array.from(groupedByClient.entries())
            .map(([clientId, { name }]) => ({ clientId, name }))
            .filter((c) =>
                [c.clientId, c.name].some((v) =>
                    v.toLowerCase().includes(search.toLowerCase()),
                ),
            )
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [groupedByClient, search]);

    const loadSchedules = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/client-schedule");
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const list: Schedule[] = res.data?.schedules ?? [];
            setSchedules(
                list.sort(
                    (a, b) =>
                        new Date(b.endDate).getTime() -
                        new Date(a.endDate).getTime(),
                ),
            );
        } catch (e) {
            enqueueSnackbar("Error al cargar los horarios", {
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadSchedules();
    }, []);

    const openCreateForClient = (clientId: string, clientName: string) => {
        setActiveClient({ id: clientId, name: clientName });
        setForm({
            ...emptyForm,
            clientId,
            clientName,
            startDate: toDateInputValue(new Date()),
            endDate: toDateInputValue(new Date()),
        });
        createDisclosure.onOpen();
    };

    const submitCreate = async () => {
        try {
            setCreating(true);
            const payload = {
                ...form,
                monday: form.monday ? Number(form.monday) : null,
                tuesday: form.tuesday ? Number(form.tuesday) : null,
                wednesday: form.wednesday ? Number(form.wednesday) : null,
                thursday: form.thursday ? Number(form.thursday) : null,
                friday: form.friday ? Number(form.friday) : null,
                saturday: form.saturday ? Number(form.saturday) : null,
                sunday: form.sunday ? Number(form.sunday) : null,
            };
            await axios.post("/api/client-schedule", payload);
            enqueueSnackbar(
                "Horario creado. La fecha de fin del horario anterior fue ajustada.",
                {
                    variant: "success",
                },
            );
            createDisclosure.onClose();
            await loadSchedules();
        } catch (e) {
            enqueueSnackbar("Error al crear el horario", { variant: "error" });
        } finally {
            setCreating(false);
        }
    };

    const openEdit = (s: Schedule) => {
        setEditTarget(s);
        setForm({
            id: s.id,
            clientId: s.clientId,
            clientName: s.clientName,
            service: s.service,
            startDate: toDateInputValue(s.startDate),
            endDate: toDateInputValue(s.endDate),
            monday: (s.monday ?? "").toString(),
            tuesday: (s.tuesday ?? "").toString(),
            wednesday: (s.wednesday ?? "").toString(),
            thursday: (s.thursday ?? "").toString(),
            friday: (s.friday ?? "").toString(),
            saturday: (s.saturday ?? "").toString(),
            sunday: (s.sunday ?? "").toString(),
            multiple: !!s.multiple,
        });
        editDisclosure.onOpen();
    };

    const submitEdit = async () => {
        try {
            setUpdating(true);
            const { id, ...rest } = form;
            await axios.put("/api/client-schedule", {
                id,
                ...rest,
                monday: rest.monday ? Number(rest.monday) : null,
                tuesday: rest.tuesday ? Number(rest.tuesday) : null,
                wednesday: rest.wednesday ? Number(rest.wednesday) : null,
                thursday: rest.thursday ? Number(rest.thursday) : null,
                friday: rest.friday ? Number(rest.friday) : null,
                saturday: rest.saturday ? Number(rest.saturday) : null,
                sunday: rest.sunday ? Number(rest.sunday) : null,
            });
            enqueueSnackbar("Horario actualizado", { variant: "success" });
            editDisclosure.onClose();
            await loadSchedules();
        } catch (e) {
            enqueueSnackbar("Error al actualizar el horario", {
                variant: "error",
            });
        } finally {
            setUpdating(false);
        }
    };

    const confirmDelete = (s: Schedule) => {
        setDeleteTarget(s);
        deleteDisclosure.onOpen();
    };

    const submitDelete = async () => {
        if (!deleteTarget) return;
        try {
            setRemoving(true);
            await axios.delete("/api/client-schedule", {
                data: { id: deleteTarget.id },
            });
            enqueueSnackbar("Horario eliminado", { variant: "success" });
            deleteDisclosure.onClose();
            await loadSchedules();
        } catch (e) {
            enqueueSnackbar("Error al eliminar el horario", {
                variant: "error",
            });
        } finally {
            setRemoving(false);
        }
    };

    const renderDayColumn = (label: string, key: keyof UpsertForm) => (
        <Input
            label={label}
            type="number"
            value={(form[key] as string) ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            min={0}
        />
    );

    return (
        <div className="mt-8">
            <div className="mb-4 flex items-center gap-3">
                <Input
                    placeholder="Buscar clientes por ID o nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-md"
                />
                <Chip color="primary" variant="flat">
                    {loading
                        ? "Cargando..."
                        : `${schedules.length} horarios en total`}
                </Chip>
            </div>

            <Accordion variant="splitted">
                {distinctClients.map((client) => {
                    const list =
                        groupedByClient.get(client.clientId)?.schedules ?? [];
                    return (
                        <AccordionItem
                            key={client.clientId}
                            aria-label={client.name}
                            startContent={<FiUsers />}
                            title={
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">
                                        {client.name}
                                    </span>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color="primary"
                                    >
                                        {client.clientId}
                                    </Chip>
                                </div>
                            }
                        >
                            <div className="mb-3 flex justify-end">
                                <Button
                                    color="primary"
                                    startContent={<FiPlus />}
                                    onPress={() =>
                                        openCreateForClient(
                                            client.clientId,
                                            client.name,
                                        )
                                    }
                                >
                                    Agregar horario
                                </Button>
                            </div>

                            <div className="overflow-auto">
                                <Table aria-label="Horarios del cliente">
                                    <TableHeader>
                                        <TableColumn>Cliente</TableColumn>
                                        <TableColumn>Servicio</TableColumn>
                                        <TableColumn>Inicio</TableColumn>
                                        <TableColumn>Fin</TableColumn>
                                        <TableColumn>Lun</TableColumn>
                                        <TableColumn>Mar</TableColumn>
                                        <TableColumn>Mié</TableColumn>
                                        <TableColumn>Jue</TableColumn>
                                        <TableColumn>Vie</TableColumn>
                                        <TableColumn>Sáb</TableColumn>
                                        <TableColumn>Dom</TableColumn>
                                        <TableColumn>Múltiple</TableColumn>
                                        <TableColumn>Acciones</TableColumn>
                                    </TableHeader>
                                    <TableBody
                                        emptyContent={
                                            loading
                                                ? "Cargando horarios..."
                                                : "Sin horarios"
                                        }
                                    >
                                        {list.map((s) => (
                                            <TableRow key={s.id}>
                                                <TableCell>
                                                    {s.clientName}
                                                </TableCell>
                                                <TableCell>
                                                    {s.service}
                                                </TableCell>
                                                <TableCell>
                                                    {toDateInputValue(
                                                        s.startDate,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {toDateInputValue(
                                                        s.endDate,
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {s.monday ?? "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {s.tuesday ?? "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {s.wednesday ?? "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {s.thursday ?? "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {s.friday ?? "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {s.saturday ?? "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {s.sunday ?? "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {s.multiple ? "Sí" : "No"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="flat"
                                                            onPress={() =>
                                                                openEdit(s)
                                                            }
                                                            startContent={
                                                                <FiEdit2 />
                                                            }
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            color="danger"
                                                            variant="flat"
                                                            onPress={() =>
                                                                confirmDelete(s)
                                                            }
                                                            startContent={
                                                                <FiTrash2 />
                                                            }
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </AccordionItem>
                    );
                })}
            </Accordion>

            {/* Create Modal */}
            <Modal
                isOpen={createDisclosure.isOpen}
                onOpenChange={createDisclosure.onOpenChange}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Crear horario</ModalHeader>
                            <ModalBody>
                                <Card className="bg-primary/5">
                                    <CardBody>
                                        <p className="text-sm text-gray-700">
                                            Al agregar un nuevo horario, se
                                            actualizará automáticamente el
                                            último horario existente de este
                                            cliente y servicio para que termine
                                            el día anterior a la nueva fecha de
                                            inicio.
                                        </p>
                                    </CardBody>
                                </Card>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <Input
                                        label="ID del cliente"
                                        value={form.clientId}
                                        isReadOnly
                                    />
                                    <Input
                                        label="Nombre del cliente"
                                        value={form.clientName}
                                        isReadOnly
                                    />
                                    <Input
                                        label="Servicio"
                                        value={form.service}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                service: e.target.value,
                                            }))
                                        }
                                    />
                                    <Checkbox
                                        isSelected={!!form.multiple}
                                        onValueChange={(v) =>
                                            setForm((f) => ({
                                                ...f,
                                                multiple: v,
                                            }))
                                        }
                                    >
                                        Múltiple
                                    </Checkbox>
                                    <Input
                                        type="date"
                                        label="Fecha de inicio"
                                        value={form.startDate}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                startDate: e.target.value,
                                            }))
                                        }
                                    />
                                    <Input
                                        type="date"
                                        label="Fecha de fin"
                                        value={form.endDate}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                endDate: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                    {renderDayColumn("Lun", "monday")}
                                    {renderDayColumn("Mar", "tuesday")}
                                    {renderDayColumn("Mié", "wednesday")}
                                    {renderDayColumn("Jue", "thursday")}
                                    {renderDayColumn("Vie", "friday")}
                                    {renderDayColumn("Sáb", "saturday")}
                                    {renderDayColumn("Dom", "sunday")}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={() => void submitCreate()}
                                    isLoading={creating}
                                >
                                    Crear
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editDisclosure.isOpen}
                onOpenChange={editDisclosure.onOpenChange}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Editar horario</ModalHeader>
                            <ModalBody>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <Input
                                        label="ID del cliente"
                                        value={form.clientId}
                                        isReadOnly
                                    />
                                    <Input
                                        label="Nombre del cliente"
                                        value={form.clientName}
                                        isReadOnly
                                    />
                                    <Input
                                        label="Servicio"
                                        value={form.service}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                service: e.target.value,
                                            }))
                                        }
                                    />
                                    <Checkbox
                                        isSelected={!!form.multiple}
                                        onValueChange={(v) =>
                                            setForm((f) => ({
                                                ...f,
                                                multiple: v,
                                            }))
                                        }
                                    >
                                        Múltiple
                                    </Checkbox>
                                    <Input
                                        type="date"
                                        label="Fecha de inicio"
                                        value={form.startDate}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                startDate: e.target.value,
                                            }))
                                        }
                                    />
                                    <Input
                                        type="date"
                                        label="Fecha de fin"
                                        value={form.endDate}
                                        onChange={(e) =>
                                            setForm((f) => ({
                                                ...f,
                                                endDate: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                    {renderDayColumn("Lun", "monday")}
                                    {renderDayColumn("Mar", "tuesday")}
                                    {renderDayColumn("Mié", "wednesday")}
                                    {renderDayColumn("Jue", "thursday")}
                                    {renderDayColumn("Vie", "friday")}
                                    {renderDayColumn("Sáb", "saturday")}
                                    {renderDayColumn("Dom", "sunday")}
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={() => void submitEdit()}
                                    isLoading={updating}
                                >
                                    Guardar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Delete confirmation */}
            <Modal
                isOpen={deleteDisclosure.isOpen}
                onOpenChange={deleteDisclosure.onOpenChange}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader>Confirmar eliminación</ModalHeader>
                            <ModalBody>
                                <Card className="bg-red-50">
                                    <CardBody>
                                        <p className="text-sm text-red-700">
                                            Eliminar un horario no se puede
                                            deshacer. Asegúrate de que este
                                            cliente tenga un horario válido que
                                            cubra las fechas necesarias.
                                        </p>
                                    </CardBody>
                                </Card>
                                <p className="text-sm text-gray-700">
                                    Estás a punto de eliminar el horario ID{" "}
                                    {deleteTarget?.id} de{" "}
                                    {deleteTarget?.clientName} (
                                    {deleteTarget?.clientId}) - servicio{" "}
                                    {deleteTarget?.service}.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose}>
                                    Cancelar
                                </Button>
                                <Button
                                    color="danger"
                                    onPress={() => void submitDelete()}
                                    isLoading={removing}
                                >
                                    Eliminar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
