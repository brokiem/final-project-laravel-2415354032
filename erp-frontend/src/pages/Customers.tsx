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
import { Plus, Key, Ban, Pencil, Trash2, Menu } from "lucide-react"

type Customer = {
    id: number
    customer_id: string
    name: string
    email: string
    phone: string
    address: string
    status: boolean
}

export function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Partial<Customer>>({
        customer_id: "",
        name: "",
        email: "",
        phone: "",
        address: "",
    })

    const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const res = await axios.get("/api/customers")
            if (res.data.success) {
                setCustomers(res.data.data)
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to fetch customers")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCustomers()
    }, [])

    const handleOpenDialog = (customer?: Customer) => {
        if (customer) {
            setIsEditing(true)
            setFormData(customer)
        } else {
            setIsEditing(false)
            setFormData({
                customer_id: "",
                name: "",
                email: "",
                phone: "",
                address: "",
            })
        }
        setFormErrors({})
        setIsDialogOpen(true)
    }

    const handleSave = async () => {
        try {
            if (isEditing && formData.id) {
                await axios.put(`/api/customers/${formData.id}`, formData)
                toast.success("Customer updated successfully")
            } else {
                await axios.post("/api/customers", formData)
                toast.success("Customer created successfully")
            }
            setIsDialogOpen(false)
            fetchCustomers()
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
        if (!window.confirm("Are you sure you want to delete this customer?")) return
        try {
            await axios.delete(`/api/customers/${id}`)
            toast.success("Customer deleted successfully")
            fetchCustomers()
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete customer")
        }
    }

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const action = currentStatus ? "deactivate" : "activate"
            await axios.patch(`/api/customers/${id}/${action}`)
            toast.success(`Customer ${action}d successfully`)
            fetchCustomers()
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update status")
        }
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
                            <TableHead className="w-[120px]">Customer ID</TableHead>
                            <TableHead>Customer Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[80px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                    No customers found. Add your first customer.
                                </TableCell>
                            </TableRow>
                        )}
                        {customers.map((customer) => (
                            <TableRow key={customer.id}>
                                <TableCell className="font-medium">
                                    <span className="rounded px-1">{customer.customer_id}</span>
                                </TableCell>
                                <TableCell>{customer.name}</TableCell>
                                <TableCell>{customer.email}</TableCell>
                                <TableCell>{customer.address}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={customer.status ? "default" : "destructive"}
                                        className={
                                            customer.status
                                                ? "bg-green-100 text-green-700 hover:bg-green-100/80"
                                                : "bg-red-100 text-red-700 hover:bg-red-100/80"
                                        }
                                    >
                                        {customer.status ? "Active" : "Inactive"}
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
                                            <DropdownMenuItem onClick={() => handleToggleStatus(customer.id, customer.status)}>
                                                {customer.status ? (
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
                                            <DropdownMenuItem onClick={() => handleOpenDialog(customer)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(customer.id)}
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
                        <DialogTitle>{isEditing ? "Edit Customer" : "Add Customer"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="customer_id">Customer ID</Label>
                            <Input
                                id="customer_id"
                                value={formData.customer_id || ""}
                                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                            />
                            {formErrors.customer_id && <p className="text-sm text-destructive">{formErrors.customer_id[0]}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            {formErrors.name && <p className="text-sm text-destructive">{formErrors.name[0]}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email || ""}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            {formErrors.email && <p className="text-sm text-destructive">{formErrors.email[0]}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone || ""}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                            {formErrors.phone && <p className="text-sm text-destructive">{formErrors.phone[0]}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={formData.address || ""}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                            {formErrors.address && <p className="text-sm text-destructive">{formErrors.address[0]}</p>}
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
