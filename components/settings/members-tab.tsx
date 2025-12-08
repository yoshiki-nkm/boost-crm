"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import type { User } from "@/types/database"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil, Trash2 } from "lucide-react"

export function MembersTab() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [lastName, setLastName] = useState("")
  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [slackId, setSlackId] = useState("")
  const [profileImageUrl, setProfileImageUrl] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("createdAt", { ascending: false })

      if (error) throw error

      setUsers(data || [])
      setError(null)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleCreate = () => {
    setIsEditMode(false)
    setSelectedUser(null)
    setLastName("")
    setFirstName("")
    setEmail("")
    setSlackId("")
    setProfileImageUrl("")
    setIsDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setIsEditMode(true)
    setSelectedUser(user)
    setLastName(user.lastName || "")
    setFirstName(user.firstName || "")
    setEmail(user.email)
    setSlackId(user.slackId || "")
    setProfileImageUrl(user.profileImageUrl || "")
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      if (!email.trim()) {
        alert("Email is required")
        return
      }

      const userData = {
        lastName: lastName.trim() || null,
        firstName: firstName.trim() || null,
        email: email.trim(),
        slackId: slackId.trim() || null,
        profileImageUrl: profileImageUrl.trim() || null,
        updatedAt: new Date().toISOString(),
      }

      if (isEditMode && selectedUser) {
        const { error } = await supabase
          .from("users")
          .update(userData)
          .eq("id", selectedUser.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from("users")
          .insert({
            ...userData,
            createdAt: new Date().toISOString(),
          })

        if (error) throw error
      }

      fetchUsers()
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Error saving user:", err)
      alert("Failed to save: " + (err instanceof Error ? err.message : "Unknown error"))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (user: User) => {
    if (!confirm("Delete " + user.lastName + " " + user.firstName + "?")) {
      return
    }

    try {
      const { error } = await supabase.from("users").delete().eq("id", user.id)

      if (error) throw error

      fetchUsers()
    } catch (err) {
      console.error("Error deleting user:", err)
      alert("Failed to delete: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Member Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage team members
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>

      {loading ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-8 text-center text-destructive">
          <p>Error: {error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">
          <p>No members registered</p>
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Slack ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.lastName} {user.firstName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.slackId || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Member" : "Add Member"}
            </DialogTitle>
            <DialogDescription>
              Enter member information
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Yamada"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Taro"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yamada@example.com"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slackId">Slack ID</Label>
              <Input
                id="slackId"
                value={slackId}
                onChange={(e) => setSlackId(e.target.value)}
                placeholder="U01234ABCD"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="profileImageUrl">Profile Image URL</Label>
              <Input
                id="profileImageUrl"
                type="url"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                placeholder="https://example.com/avatar.png"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
