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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Pencil, Trash2, Menu, Key, KeyboardOff, Timer, StopCircle, X } from "lucide-react"

type Customer = {
    id: number
    name: string
    customer_id: string
}

type Service = {
    id: number
    name: string
}

type Subscription = {
    id: number
    customer_id: number
    service_id: number
    start_date: string | null
    end_date: string | null
    status: 'active' | 'inactive' | 'trial' | 'isolir' | 'dismantle'
    customer?: Customer
    service?: Service
}

export function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    const [formData, setFormData] = useState<Partial<Subscription>>({
        customer_id: 0,
        service_id: 0,
        status: 'active',
    })

    const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})

    const fetchData = async () => {
        try {
            setLoading(true)
            const [subsRes, custRes, servRes] = await Promise.all([
                axios.get("/api/subscriptions"),
                axios.get("/api/customers"),
                axios.get("/api/services"),
            ])

            if (subsRes.data.success) {
                setSubscriptions(subsRes.data.data)
            }
            if (custRes.data.success) {
                setCustomers(custRes.data.data)
            }
            if (servRes.data.success) {
                setServices(servRes.data.data)
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to fetch data")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleOpenDialog = (subscription?: Subscription) => {
        if (subscription) {
            setIsEditing(true)
            setFormData({
                ...subscription,
                start_date: subscription.start_date ? subscription.start_date.split('T')[0] : "",
                end_date: subscription.end_date ? subscription.end_date.split('T')[0] : "",
            })
        } else {
            setIsEditing(false)
            setFormData({
                status: 'active',
            })
        }
        setFormErrors({})
        setIsDialogOpen(true)
    }

    const handleStatusChange = async (subscription?: Subscription, status?: string) => {
        if (!subscription || !status) return

        try {
            const dataToSubmit = {
                ...subscription,
                status: status as Subscription['status']
            }
            if (!dataToSubmit.start_date) dataToSubmit.start_date = null
            if (!dataToSubmit.end_date) dataToSubmit.end_date = null

            await axios.put(`/api/subscriptions/${subscription.id}`, dataToSubmit)
            toast.success("Subscription status updated successfully")
            fetchData()
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to update status")
        }
    }

    const handleSave = async () => {
        try {
            // Clean up empty dates
            const dataToSubmit = { ...formData }
            if (!dataToSubmit.start_date) dataToSubmit.start_date = null
            if (!dataToSubmit.end_date) dataToSubmit.end_date = null

            if (isEditing && formData.id) {
                await axios.put(`/api/subscriptions/${formData.id}`, dataToSubmit)
                toast.success("Subscription updated successfully")
            } else {
                await axios.post("/api/subscriptions", dataToSubmit)
                toast.success("Subscription created successfully")
            }
            setIsDialogOpen(false)
            fetchData()
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
        if (!window.confirm("Are you sure you want to delete this subscription?")) return
        try {
            await axios.delete(`/api/subscriptions/${id}`)
            toast.success("Subscription deleted successfully")
            fetchData()
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to delete subscription")
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return "bg-green-100 text-green-700 hover:bg-green-100/80"
            case 'inactive':
                return "bg-gray-100 text-gray-700 hover:bg-gray-100/80"
            case 'trial':
                return "bg-blue-100 text-blue-700 hover:bg-blue-100/80"
            case 'isolir':
                return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80"
            case 'dismantle':
                return "bg-red-100 text-red-700 hover:bg-red-100/80"
            default:
                return ""
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
                            <TableHead>Customer</TableHead>
                            <TableHead>Service</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[80px]">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subscriptions.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                                    No subscriptions found. Add your first subscription.
                                </TableCell>
                            </TableRow>
                        )}
                        {subscriptions.map((subscription) => (
                            <TableRow key={subscription.id}>
                                <TableCell>
                                    <div className="font-medium">{subscription.customer?.name}</div>
                                    <div className="text-xs text-muted-foreground">{subscription.customer?.customer_id}</div>
                                </TableCell>
                                <TableCell>{subscription.service?.name}</TableCell>
                                <TableCell>{subscription.start_date ? new Date(subscription.start_date).toLocaleDateString() : '-'}</TableCell>
                                <TableCell>{subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : '-'}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`capitalize ${getStatusColor(subscription.status)} border-transparent`}
                                    >
                                        {subscription.status}
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
                                            <DropdownMenuItem onClick={() => handleStatusChange(subscription, 'active')}>
                                                <Key className="mr-2 h-4 w-4" />
                                                <span>Active</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(subscription, 'inactive')}>
                                                <KeyboardOff className="mr-2 h-4 w-4" />
                                                <span>Deactivate</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(subscription, 'trial')}>
                                                <Timer className="mr-2 h-4 w-4" />
                                                <span>Trial</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(subscription, 'isolir')}>
                                                <StopCircle className="mr-2 h-4 w-4" />
                                                <span>Isolir</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(subscription, 'dismantle')}>
                                                <X className="mr-2 h-4 w-4" />
                                                <span>Dismantle</span>
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
                        <DialogTitle>{isEditing ? "Edit Subscription" : "Add Subscription"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">

                        <div className="grid gap-2">
                            <Label htmlFor="customer_id">Customer</Label>
                            <Select
                                value={formData.customer_id ? formData.customer_id.toString() : ""}
                                onValueChange={(val) => setFormData({ ...formData, customer_id: Number(val) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>{c.name} ({c.customer_id})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.customer_id && <p className="text-sm text-destructive">{formErrors.customer_id[0]}</p>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="service_id">Service</Label>
                            <Select
                                value={formData.service_id ? formData.service_id.toString() : ""}
                                onValueChange={(val) => setFormData({ ...formData, service_id: Number(val) })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a service" />
                                </SelectTrigger>
                                <SelectContent>
                                    {services.map((s) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {formErrors.service_id && <p className="text-sm text-destructive">{formErrors.service_id[0]}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start_date">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date || ""}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                                {formErrors.start_date && <p className="text-sm text-destructive">{formErrors.start_date[0]}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="end_date">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date || ""}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                />
                                {formErrors.end_date && <p className="text-sm text-destructive">{formErrors.end_date[0]}</p>}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status || ""}
                                onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="trial">Trial</SelectItem>
                                    <SelectItem value="isolir">Isolir</SelectItem>
                                    <SelectItem value="dismantle">Dismantle</SelectItem>
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
