"use client";

import React, { useState, useEffect } from "react";
import {
    Button,
    Card,
    CardBody,
    Input,
    Spinner,
    Tabs,
    Tab,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@nextui-org/react";
import { enqueueSnackbar } from "notistack";
import {
    FiEdit3,
    FiTrash2,
    FiPlus,
    FiX,
    FiAlertTriangle,
    FiEye,
    FiEyeOff,
} from "react-icons/fi";

interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role?: string;
    createdAt: string;
}

interface UserFormData {
    name: string;
    email: string;
    password: string;
}

function UserData() {
    const [activeTab, setActiveTab] = useState("analyser");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(
        new Set(),
    );
    const [formData, setFormData] = useState<UserFormData>({
        name: "",
        email: "",
        password: "",
    });
    const { isOpen, onOpen, onClose } = useDisclosure();

    const tabs = [
        { id: "analyser", label: "Analysis Users" },
        { id: "jobApplications", label: "Job Applications" },
        { id: "training", label: "Training Users" },
    ];

    const fetchUsers = async (table: string) => {
        setLoading(true);
        try {
            const response = await fetch(
                `/api/users?table=${table}&role=admin`,
            );
            const data: { users?: User[]; error?: string } =
                await response.json();

            if (response.ok && data.users) {
                setUsers(data.users);
            } else {
                enqueueSnackbar(data.error || "Failed to fetch users", {
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            enqueueSnackbar("An error occurred while fetching users", {
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchUsers(activeTab);
    }, [activeTab]);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    table: activeTab,
                    userRole: "admin",
                    ...formData,
                }),
            });
            const data: { user?: User; error?: string } = await response.json();

            if (response.ok && data.user) {
                setUsers([...users, data.user]);
                setFormData({ name: "", email: "", password: "" });
                enqueueSnackbar("User added successfully", {
                    variant: "success",
                });
            } else {
                enqueueSnackbar(data.error || "Failed to add user", {
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Error adding user:", error);
            enqueueSnackbar("An error occurred while adding user", {
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setLoading(true);
        try {
            const response = await fetch("/api/users", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    table: activeTab,
                    id: editingUser.id,
                    userRole: "admin",
                    ...formData,
                }),
            });
            const data: { user?: User; error?: string } = await response.json();

            if (response.ok && data.user) {
                setUsers(
                    users.map((user) =>
                        user.id === editingUser.id ? data.user! : user,
                    ),
                );
                setEditingUser(null);
                setFormData({ name: "", email: "", password: "" });
                enqueueSnackbar("User updated successfully", {
                    variant: "success",
                });
            } else {
                enqueueSnackbar(data.error || "Failed to update user", {
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Error updating user:", error);
            enqueueSnackbar("An error occurred while updating user", {
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: number) => {
        setLoading(true);
        try {
            const response = await fetch("/api/users", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    table: activeTab,
                    id: userId,
                    userRole: "admin",
                }),
            });
            const data: { success?: boolean; error?: string } =
                await response.json();

            if (response.ok && data.success) {
                setUsers(users.filter((user) => user.id !== userId));
                enqueueSnackbar("User deleted successfully", {
                    variant: "success",
                });
            } else {
                enqueueSnackbar(data.error || "Failed to delete user", {
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Error deleting user:", error);
            enqueueSnackbar("An error occurred while deleting user", {
                variant: "error",
            });
        } finally {
            setLoading(false);
            onClose();
            setUserToDelete(null);
        }
    };

    const openDeleteModal = (user: User) => {
        setUserToDelete(user);
        onOpen();
    };

    const togglePasswordVisibility = (userId: number) => {
        setVisiblePasswords((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const startEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: user.password,
        });
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setFormData({ name: "", email: "", password: "" });
    };

    return (
        <>
            <Card className="mx-auto my-6  border-2 border-primary/10 bg-gradient-to-br from-transparent via-primary/5 to-transparent">
                <CardBody className="p-6">
                    {/* Header with gradient background */}
                    <div className="relative mb-8 flex flex-col items-center justify-between gap-8 rounded-xl bg-gradient-to-br from-transparent via-primary/5 to-transparent p-8">
                        <h2 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-2xl font-bold uppercase text-transparent sm:text-4xl">
                            User Management
                        </h2>
                        <div className="mt-2 h-1 w-20 rounded bg-gradient-to-r from-primary/30 to-primary/20 sm:w-32"></div>
                    </div>

                    {/* NextUI Tabs */}
                    <Tabs
                        selectedKey={activeTab}
                        onSelectionChange={(key) => {
                            setActiveTab(key as string);
                            setEditingUser(null);
                            setFormData({ name: "", email: "", password: "" });
                        }}
                        className="mb-6"
                        color="primary"
                        variant="underlined"
                    >
                        {tabs.map((tab) => (
                            <Tab key={tab.id} title={tab.label} />
                        ))}
                    </Tabs>

                    {/* Form Card */}
                    <Card className="mb-6 border-2 border-primary/10 bg-gradient-to-br from-transparent via-primary/5 to-transparent">
                        <CardBody className="p-6">
                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-primary">
                                    {editingUser
                                        ? "Edit User"
                                        : `Add New ${tabs
                                              .find((t) => t.id === activeTab)
                                              ?.label.replace(" Users", "")
                                              .replace(
                                                  " Applications",
                                                  "",
                                              )} User`}
                                </h3>
                            </div>

                            <form
                                onSubmit={
                                    editingUser
                                        ? handleUpdateUser
                                        : handleAddUser
                                }
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <Input
                                        type="text"
                                        placeholder="Name"
                                        value={formData.name}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                name: value,
                                            })
                                        }
                                        isRequired
                                        variant="bordered"
                                        classNames={{
                                            inputWrapper:
                                                "border-primary/20 focus-within:border-primary",
                                        }}
                                    />
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        value={formData.email}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                email: value,
                                            })
                                        }
                                        isRequired
                                        variant="bordered"
                                        classNames={{
                                            inputWrapper:
                                                "border-primary/20 focus-within:border-primary",
                                        }}
                                    />
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onValueChange={(value) =>
                                            setFormData({
                                                ...formData,
                                                password: value,
                                            })
                                        }
                                        isRequired
                                        variant="bordered"
                                        classNames={{
                                            inputWrapper:
                                                "border-primary/20 focus-within:border-primary",
                                        }}
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button
                                        type="submit"
                                        color="primary"
                                        variant="shadow"
                                        disabled={loading}
                                        startContent={
                                            loading ? (
                                                <Spinner size="sm" />
                                            ) : (
                                                <FiPlus />
                                            )
                                        }
                                    >
                                        {loading
                                            ? "Saving..."
                                            : editingUser
                                              ? "Update User"
                                              : "Add User"}
                                    </Button>
                                    {editingUser && (
                                        <Button
                                            type="button"
                                            variant="bordered"
                                            color="danger"
                                            onPress={cancelEdit}
                                            startContent={<FiX />}
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </form>
                        </CardBody>
                    </Card>

                    {/* Users Table */}
                    <Card className="border-2 border-primary/10 bg-white">
                        <CardBody className="p-0">
                            {loading ? (
                                <div className="flex items-center justify-center p-8">
                                    <Spinner size="lg" />
                                    <span className="ml-3 text-gray-500">
                                        Loading users...
                                    </span>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-primary/5 to-primary/10">
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-primary">
                                                    Name
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-primary">
                                                    Email
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-primary">
                                                    Password
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-primary">
                                                    Created
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider text-primary">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/10">
                                            {users.map((user) => (
                                                <tr
                                                    key={user.id}
                                                    className="transition-colors hover:bg-primary/5"
                                                >
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {user.name}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                        {user.email}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono">
                                                                {visiblePasswords.has(
                                                                    user.id,
                                                                )
                                                                    ? user.password
                                                                    : "••••••••"}
                                                            </span>
                                                            <Button
                                                                size="sm"
                                                                variant="light"
                                                                color="primary"
                                                                onPress={() =>
                                                                    togglePasswordVisibility(
                                                                        user.id,
                                                                    )
                                                                }
                                                                startContent={
                                                                    visiblePasswords.has(
                                                                        user.id,
                                                                    ) ? (
                                                                        <FiEyeOff
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    ) : (
                                                                        <FiEye
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    )
                                                                }
                                                            >
                                                                {visiblePasswords.has(
                                                                    user.id,
                                                                )
                                                                    ? "Hide"
                                                                    : "Show"}
                                                            </Button>
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                        {new Date(
                                                            user.createdAt,
                                                        ).toLocaleDateString()}
                                                    </td>
                                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                size="sm"
                                                                variant="bordered"
                                                                color="warning"
                                                                onPress={() =>
                                                                    startEdit(
                                                                        user,
                                                                    )
                                                                }
                                                                startContent={
                                                                    <FiEdit3 />
                                                                }
                                                            >
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="bordered"
                                                                color="danger"
                                                                onPress={() =>
                                                                    openDeleteModal(
                                                                        user,
                                                                    )
                                                                }
                                                                startContent={
                                                                    <FiTrash2 />
                                                                }
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                            {users.length === 0 && !loading && (
                                <div className="flex flex-col items-center justify-center p-8 text-center">
                                    <div className="mb-2 text-4xl text-primary/30">
                                        👥
                                    </div>
                                    <p className="text-gray-500">
                                        No users found in this table
                                    </p>
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </CardBody>
            </Card>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="sm">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <FiAlertTriangle className="text-danger" />
                                    <span className="font-semibold text-danger">
                                        Confirm Delete
                                    </span>
                                </div>
                            </ModalHeader>
                            <ModalBody>
                                <p className="text-gray-600">
                                    Are you sure you want to delete{" "}
                                    <span className="font-semibold text-gray-900">
                                        {userToDelete?.name}
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                            </ModalBody>
                            <ModalFooter>
                                <Button
                                    color="default"
                                    variant="bordered"
                                    onPress={onClose}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    color="danger"
                                    variant="shadow"
                                    onPress={() =>
                                        userToDelete &&
                                        handleDeleteUser(userToDelete.id)
                                    }
                                    disabled={loading}
                                    startContent={
                                        loading ? (
                                            <Spinner size="sm" />
                                        ) : (
                                            <FiTrash2 />
                                        )
                                    }
                                >
                                    {loading ? "Deleting..." : "Delete User"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}

export default UserData;
