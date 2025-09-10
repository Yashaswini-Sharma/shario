"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Package, Heart, Settings, MapPin, CreditCard, Bell, Shield, Edit, Eye, Truck } from "lucide-react"

// Mock user data
const userData = {
  firstName: "Sarah",
  lastName: "Johnson",
  email: "sarah.johnson@email.com",
  phone: "+1 (555) 123-4567",
  avatar: "/user-avatar-sarah.jpg",
  joinDate: "January 2023",
  totalOrders: 12,
  totalSpent: 1247.89,
}

// Mock order data
const orders = [
  {
    id: "SO-2024-001",
    date: "2024-01-15",
    status: "delivered",
    total: 149.97,
    items: 3,
    trackingNumber: "1Z999AA1234567890",
  },
  {
    id: "SO-2024-002",
    date: "2024-01-10",
    status: "shipped",
    total: 89.99,
    items: 1,
    trackingNumber: "1Z999AA1234567891",
  },
  {
    id: "SO-2024-003",
    date: "2024-01-05",
    status: "processing",
    total: 199.98,
    items: 2,
    trackingNumber: null,
  },
]

// Mock wishlist data
const wishlistItems = [
  {
    id: 1,
    name: "Premium Cotton T-Shirt",
    brand: "StyleCo",
    price: 29.99,
    originalPrice: 39.99,
    image: "/premium-cotton-t-shirt-fashion.jpg",
    inStock: true,
  },
  {
    id: 2,
    name: "Elegant Summer Dress",
    brand: "ChicStyle",
    price: 79.99,
    originalPrice: 99.99,
    image: "/elegant-summer-dress-fashion.jpg",
    inStock: true,
  },
  {
    id: 3,
    name: "Leather Handbag",
    brand: "LuxeAccessories",
    price: 149.99,
    originalPrice: 199.99,
    image: "/leather-handbag-fashion-accessory.jpg",
    inStock: false,
  },
]

// Mock addresses
const addresses = [
  {
    id: 1,
    type: "Home",
    name: "Sarah Johnson",
    address: "123 Main Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    isDefault: true,
  },
  {
    id: 2,
    type: "Work",
    name: "Sarah Johnson",
    address: "456 Business Ave, Suite 200",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    isDefault: false,
  },
]

export function UserAccount() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState(userData)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800"
      case "shipped":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Account</h1>
        <p className="text-muted-foreground">Manage your Share.io account and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Profile Information</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profileData.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {profileData.firstName[0]}
                      {profileData.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {profileData.firstName} {profileData.lastName}
                    </h3>
                    <p className="text-muted-foreground">{profileData.email}</p>
                    <p className="text-sm text-muted-foreground">Member since {profileData.joinDate}</p>
                  </div>
                </div>

                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Button onClick={() => setIsEditing(false)}>Save Changes</Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <p>{profileData.email}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Phone:</span>
                      <p>{profileData.phone}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Account Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userData.totalOrders}</div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">${userData.totalSpent}</div>
                  <div className="text-sm text-muted-foreground">Total Spent</div>
                </div>
                <Separator />
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{wishlistItems.length}</div>
                  <div className="text-sm text-muted-foreground">Wishlist Items</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.date} • {order.items} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      <p className="text-sm font-semibold mt-1">${order.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{order.id}</h3>
                        <p className="text-sm text-muted-foreground">Placed on {order.date}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total:</span>
                        <p className="font-semibold">${order.total}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Items:</span>
                        <p>{order.items}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p className="capitalize">{order.status}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Tracking:</span>
                        <p>{order.trackingNumber || "N/A"}</p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {order.trackingNumber && (
                        <Button variant="outline" size="sm">
                          <Truck className="h-4 w-4 mr-2" />
                          Track Package
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wishlist Tab */}
        <TabsContent value="wishlist" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Wishlist ({wishlistItems.length} items)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item) => (
                  <div key={item.id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                      <h3 className="font-semibold line-clamp-2 mb-2">{item.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="font-bold text-primary">${item.price}</span>
                        {item.originalPrice > item.price && (
                          <span className="text-sm text-muted-foreground line-through">${item.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button className="flex-1" size="sm" disabled={!item.inStock}>
                          {item.inStock ? "Add to Cart" : "Out of Stock"}
                        </Button>
                        <Button variant="outline" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Addresses Tab */}
        <TabsContent value="addresses" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Saved Addresses</CardTitle>
              <Button>Add New Address</Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((address) => (
                  <div key={address.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={address.isDefault ? "default" : "secondary"}>{address.type}</Badge>
                      {address.isDefault && <Badge variant="outline">Default</Badge>}
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="font-semibold">{address.name}</p>
                      <p>{address.address}</p>
                      <p>
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        Delete
                      </Button>
                      {!address.isDefault && (
                        <Button variant="outline" size="sm">
                          Set as Default
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Change Password
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Enable Two-Factor Authentication
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  Download Account Data
                </Button>
                <Button variant="destructive" className="w-full justify-start">
                  Delete Account
                </Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Order Updates</span>
                  <Button variant="outline" size="sm">
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Promotional Emails</span>
                  <Button variant="outline" size="sm">
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>New Arrivals</span>
                  <Button variant="outline" size="sm">
                    Disabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>Price Drops</span>
                  <Button variant="outline" size="sm">
                    Enabled
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                    <Badge>Default</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
