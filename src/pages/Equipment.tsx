import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Package,
  Plus,
  Camera,
  Wrench,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Search,
  QrCode
} from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Equipment {
  id: string;
  name: string;
  modelNumber: string;
  serialNumber: string;
  manufacturer: string;
  location: string;
  purchaseDate: string;
  warrantyExpiry?: string;
  lastService?: string;
  nextService?: string;
  status: "operational" | "needs-service" | "out-of-order";
  techContact?: TechContact;
}

interface TechContact {
  name: string;
  company: string;
  phone: string;
  email: string;
}

const mockEquipment: Equipment[] = [
  {
    id: "1",
    name: "Walk-in Cooler",
    modelNumber: "TRUE-TWT-48SD",
    serialNumber: "TWC-2024-001234",
    manufacturer: "True Manufacturing",
    location: "Back Kitchen",
    purchaseDate: "2024-03-15",
    warrantyExpiry: "2027-03-15",
    lastService: "2025-12-10",
    nextService: "2026-03-10",
    status: "operational",
    techContact: {
      name: "Mike Johnson",
      company: "CoolTech Services",
      phone: "+1 (555) 123-4567",
      email: "mike@cooltech.com"
    }
  },
  {
    id: "2",
    name: "Combi Oven",
    modelNumber: "RATIONAL-SCC-62",
    serialNumber: "RAT-2023-005678",
    manufacturer: "Rational",
    location: "Main Line",
    purchaseDate: "2023-08-20",
    warrantyExpiry: "2026-08-20",
    lastService: "2025-11-05",
    nextService: "2026-02-05",
    status: "needs-service",
    techContact: {
      name: "Sarah Chen",
      company: "ProKitchen Repairs",
      phone: "+1 (555) 987-6543",
      email: "sarah@prokitchen.com"
    }
  },
  {
    id: "3",
    name: "Commercial Dishwasher",
    modelNumber: "HOBART-AM15",
    serialNumber: "HOB-2024-009876",
    manufacturer: "Hobart",
    location: "Dish Pit",
    purchaseDate: "2024-01-10",
    lastService: "2026-01-15",
    nextService: "2026-04-15",
    status: "operational",
    techContact: {
      name: "Dave Wilson",
      company: "Restaurant Equipment Co",
      phone: "+1 (555) 456-7890",
      email: "dave@restaurantequip.com"
    }
  },
  {
    id: "4",
    name: "6-Burner Gas Range",
    modelNumber: "VULCAN-V6B36",
    serialNumber: "VUL-2022-003456",
    manufacturer: "Vulcan",
    location: "Main Line",
    purchaseDate: "2022-05-12",
    lastService: "2025-10-20",
    status: "operational",
    techContact: {
      name: "Tom Bradley",
      company: "Gas Equipment Pros",
      phone: "+1 (555) 321-0987",
      email: "tom@gasequippros.com"
    }
  },
  {
    id: "5",
    name: "Ice Machine",
    modelNumber: "MANITOWOC-IY0524A",
    serialNumber: "MAN-2023-007654",
    manufacturer: "Manitowoc",
    location: "Bar Area",
    purchaseDate: "2023-11-01",
    warrantyExpiry: "2026-11-01",
    nextService: "2026-02-28",
    status: "out-of-order",
    techContact: {
      name: "Mike Johnson",
      company: "CoolTech Services",
      phone: "+1 (555) 123-4567",
      email: "mike@cooltech.com"
    }
  },
];

const statusConfig = {
  "operational": { label: "Operational", color: "text-success", bg: "bg-success/10", icon: CheckCircle2 },
  "needs-service": { label: "Needs Service", color: "text-warning", bg: "bg-warning/10", icon: Wrench },
  "out-of-order": { label: "Out of Order", color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle },
};

const Equipment = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(mockEquipment[0]);

  const filteredEquipment = mockEquipment.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.manufacturer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="page-title font-display">Equipment</h1>
            <p className="page-subtitle">Manage equipment, maintenance schedules & tech contacts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <QrCode className="w-4 h-4 mr-2" />
              Scan Sticker
            </Button>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </div>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search equipment, model numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Equipment List */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 card-elevated overflow-hidden"
          >
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">All Equipment ({filteredEquipment.length})</h2>
            </div>
            <div className="divide-y divide-border">
              {filteredEquipment.map(item => {
                const status = statusConfig[item.status];
                const StatusIcon = status.icon;
                const isSelected = selectedEquipment?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedEquipment(item)}
                    className={cn(
                      "p-4 cursor-pointer transition-colors",
                      isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/30"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-muted">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{item.name}</p>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", status.bg, status.color)}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.manufacturer}</p>
                        <p className="text-xs text-muted-foreground font-mono mt-1">
                          Model: {item.modelNumber}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-muted-foreground">{item.location}</p>
                        {item.nextService && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Next service: {item.nextService}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Equipment Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-4"
          >
            {selectedEquipment ? (
              <>
                {/* Details Card */}
                <div className="card-elevated p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">{selectedEquipment.name}</h3>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      statusConfig[selectedEquipment.status].bg,
                      statusConfig[selectedEquipment.status].color
                    )}>
                      {statusConfig[selectedEquipment.status].label}
                    </span>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Manufacturer</span>
                      <span className="font-medium">{selectedEquipment.manufacturer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <span className="font-mono text-xs">{selectedEquipment.modelNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Serial</span>
                      <span className="font-mono text-xs">{selectedEquipment.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span>{selectedEquipment.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Purchased</span>
                      <span>{selectedEquipment.purchaseDate}</span>
                    </div>
                    {selectedEquipment.warrantyExpiry && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Warranty Until</span>
                        <span>{selectedEquipment.warrantyExpiry}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Maintenance Schedule */}
                <div className="card-elevated p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Maintenance</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    {selectedEquipment.lastService && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Service</span>
                        <span>{selectedEquipment.lastService}</span>
                      </div>
                    )}
                    {selectedEquipment.nextService && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Next Service</span>
                        <span className="font-medium text-primary">{selectedEquipment.nextService}</span>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    <Wrench className="w-4 h-4 mr-2" />
                    Schedule Service
                  </Button>
                </div>

                {/* Tech Contact */}
                {selectedEquipment.techContact && (
                  <div className="card-elevated p-5">
                    <h3 className="font-semibold mb-4">Tech Contact</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="font-medium">{selectedEquipment.techContact.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedEquipment.techContact.company}</p>
                      </div>
                      <div className="flex gap-2">
                        <a 
                          href={`tel:${selectedEquipment.techContact.phone}`}
                          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                        >
                          <Phone className="w-4 h-4" />
                          <span className="text-sm font-medium">Call</span>
                        </a>
                        <a 
                          href={`mailto:${selectedEquipment.techContact.email}`}
                          className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg bg-muted hover:bg-secondary transition-colors"
                        >
                          <Mail className="w-4 h-4" />
                          <span className="text-sm font-medium">Email</span>
                        </a>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        {selectedEquipment.techContact.phone}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="card-elevated p-8 text-center">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Select equipment to view details</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Equipment;
