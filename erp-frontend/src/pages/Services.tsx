import { useState, useEffect } from "react"
import axios from "axios"
import { toast } from "sonner"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Key, Ban, Pencil, Trash2, Menu } from "lucide-react"

type Service = {
    id: number
    name: string
    price: number
    description: string
    status: boolean
}

export function Services() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Partial<Service>>({
        name: "",
        price: 0,
        description: "",
    })

    const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})

    const fetchServices = async () => {
        try {
            setLoading(true)
            const res = await axios.get("/api/services")
            if (res.data.success) {
                setServices(res.data.data)
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to fetch services")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchServices()
    }, [])

    const handleOpenDialog = (service?: Service) => {
        if (service) {
            setIsEditing(true)
            setFormData(service)
        } else {
            setIsEditing(false)
            setFormData({
                name: "",
                price: 0,
                description: "",
                status: true
            })
        }
        setFormErrors({})
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        try {
            if (isEditing && formData.id) {
                await axios.put(`/api/services/${formData.id}`, formData)
                toast.success("Service updated successfully")
            } else {
                await axios.post("/api/services", formData)
                toast.success("Service created successfully")
            }
            setIsDialogOpen(false)
            fetchServices()
        } catch (err: any) {
            if (err.response?.status === 422) {
                setFormErrors(err.response.data.errors)
                toast.error("Validation failed")
            } else {
                toast.error(err.response?.data?.message || "Something went wrong")
            }
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return
        try {
            await axios.delete(`/api/services/${id}`)
            toast.success("Service deleted successfully")
            fetchServices()
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete service")
        }
    }

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const action = currentStatus ? "deactivate" : "activate"
            await axios.patch(`/api/services/${id}/${action}`)
            toast.success(`Service ${action}d successfully`)
            fetchServices()
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update status")
        }
    }

    const formatPrice = (price: number) => {
        const formatted = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 2,
        }).format(price)

        return formatted
    }

    return (
        <>
            <div className="flex justify-end mb-6">
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" /> Add Data
                </Button>
            </div>

            <div className="border rounded-md bg-background overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full border-2 border-primary border-t-transparent h-6 w-6"></div>
                    </div>
                )}
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Service Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[80px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                    No services found. Add your first service.
                                </TableCell>
                            </TableRow>
                        )}
                        {services.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell>{service.name}</TableCell>
                                <TableCell>{formatPrice(service.price)}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={service.status ? "default" : "destructive"}
                                        className={
                                            service.status
                                                ? "bg-green-100 text-green-700 hover:bg-green-100/80"
                                                : "bg-red-100 text-red-700 hover:bg-red-100/80"
                                        }
                                    >
                                        {service.status ? "Active" : "Inactive"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Open menu</span>
                                                <Menu className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleToggleStatus(service.id, service.status)}>
                                                {service.status ? (
                                                    <>
                                                        <Ban className="mr-2 h-4 w-4" />
                                                        <span>Deactivate</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Key className="mr-2 h-4 w-4" />
                                                        <span>Activate</span>
                                                    </>
                                                )}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleOpenDialog(service)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(service.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Delete</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Service" : "Add Service"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Service Name</Label>
                            <Input
                                id="name"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {formErrors.name && <p className="text-sm text-destructive">{formErrors.name[0]}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price || 0}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                            />
                            {formErrors.price && <p className="text-sm text-destructive">{formErrors.price[0]}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                            {formErrors.description && <p className="text-sm text-destructive">{formErrors.description[0]}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status ? "true" : "false"}
                                onValueChange={(val) => setFormData({ ...formData, status: val === "true" })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            {formErrors.status && <p className="text-sm text-destructive">{formErrors.status[0]}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
