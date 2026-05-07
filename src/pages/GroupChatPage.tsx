import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Send, Users, LogIn, Copy, Check, MessageCircle, ArrowLeft, Hash } from "lucide-react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/components/FooterSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Room = {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
};

type Message = {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string | null;
  content: string;
  created_at: string;
};

const genCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const GroupChatPage = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const displayName = useMemo(
    () => profile?.full_name || user?.email?.split("@")[0] || "Traveller",
    [profile, user],
  );

  useEffect(() => {
    if (!user) return;
    void loadRooms();
  }, [user]);

  const loadRooms = async () => {
    const { data: memberships } = await supabase
      .from("chat_room_members")
      .select("room_id")
      .eq("user_id", user!.id);
    const ids = (memberships ?? []).map((m) => m.room_id);
    if (ids.length === 0) {
      setRooms([]);
      return;
    }
    const { data } = await supabase
      .from("chat_rooms")
      .select("*")
      .in("id", ids)
      .order("updated_at", { ascending: false });
    setRooms((data as Room[]) ?? []);
  };

  // Load messages + subscribe realtime when active room changes
  useEffect(() => {
    if (!activeRoom) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("chat_room_messages")
        .select("*")
        .eq("room_id", activeRoom.id)
        .order("created_at", { ascending: true })
        .limit(200);
      if (!cancelled) setMessages((data as Message[]) ?? []);
    })();

    const channel = supabase
      .channel(`room-${activeRoom.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_room_messages", filter: `room_id=eq.${activeRoom.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [activeRoom]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    const code = genCode();
    const { data: room, error } = await supabase
      .from("chat_rooms")
      .insert({ name: newName.trim(), description: newDesc.trim() || null, invite_code: code, created_by: user.id })
      .select()
      .single();
    if (error || !room) {
      toast({ title: "Could not create room", description: error?.message, variant: "destructive" });
      return;
    }
    await supabase.from("chat_room_members").insert({
      room_id: room.id,
      user_id: user.id,
      display_name: displayName,
      role: "owner",
    });
    setNewName("");
    setNewDesc("");
    setShowCreate(false);
    toast({ title: "Room created", description: `Invite code: ${code}` });
    await loadRooms();
    setActiveRoom(room as Room);
  };

  const handleJoin = async () => {
    if (!user || !joinCode.trim()) return;
    const code = joinCode.trim().toUpperCase();
    const { data: room, error } = await supabase
      .from("chat_rooms")
      .select("*")
      .eq("invite_code", code)
      .maybeSingle();
    if (error || !room) {
      toast({ title: "Invalid invite code", variant: "destructive" });
      return;
    }
    const { error: joinErr } = await supabase
      .from("chat_room_members")
      .insert({ room_id: room.id, user_id: user.id, display_name: displayName });
    if (joinErr && joinErr.code !== "23505") {
      toast({ title: "Could not join", description: joinErr.message, variant: "destructive" });
      return;
    }
    setJoinCode("");
    setShowJoin(false);
    await loadRooms();
    setActiveRoom(room as Room);
    toast({ title: `Joined ${room.name}` });
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content || !activeRoom || !user) return;
    setInput("");
    const { error } = await supabase.from("chat_room_messages").insert({
      room_id: activeRoom.id,
      user_id: user.id,
      display_name: displayName,
      content,
    });
    if (error) toast({ title: "Send failed", description: error.message, variant: "destructive" });
  };

  const copyCode = async () => {
    if (!activeRoom) return;
    await navigator.clipboard.writeText(activeRoom.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 pt-24 px-4">
          <div className="container mx-auto max-w-md text-center py-16">
            <MessageCircle className="h-12 w-12 mx-auto text-safari-green mb-3" />
            <h1 className="font-display text-2xl font-bold mb-2">Group Chat</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in to create a private chat room for your family or friends to plan your safari together.
            </p>
            <Button onClick={() => navigate("/auth")} className="gradient-sunset border-0">
              Sign in to chat
            </Button>
          </div>
        </main>
        <FooterSection />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Group Chat</h1>
              <p className="text-sm text-muted-foreground">
                Real-time rooms for families and friends planning a trip together.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowJoin((v) => !v)}>
                <LogIn className="h-4 w-4 mr-1.5" /> Join
              </Button>
              <Button size="sm" className="gradient-safari border-0" onClick={() => setShowCreate((v) => !v)}>
                <Plus className="h-4 w-4 mr-1.5" /> New room
              </Button>
            </div>
          </div>

          {(showCreate || showJoin) && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {showCreate && (
                <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <h3 className="font-semibold">Create a room</h3>
                  <Input placeholder="Room name (e.g. The Kamau Family)" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <Textarea placeholder="What's this trip about?" rows={2} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
                  <Button onClick={handleCreate} className="w-full gradient-safari border-0">Create</Button>
                </div>
              )}
              {showJoin && (
                <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
                  <h3 className="font-semibold">Join with invite code</h3>
                  <Input placeholder="ABC123" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
                  <Button onClick={handleJoin} className="w-full">Join room</Button>
                </div>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-[280px_1fr] gap-4 min-h-[60vh]">
            {/* Sidebar */}
            <aside className={`rounded-2xl border border-border bg-card p-3 ${activeRoom ? "hidden md:block" : ""}`}>
              <div className="text-xs uppercase tracking-wider text-muted-foreground px-2 py-1 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Your rooms
              </div>
              {rooms.length === 0 ? (
                <p className="text-xs text-muted-foreground p-3">
                  No rooms yet. Create one or join with a code.
                </p>
              ) : (
                <div className="flex flex-col gap-1 mt-1">
                  {rooms.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveRoom(r)}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeRoom?.id === r.id ? "bg-muted text-foreground" : "text-foreground/80 hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-medium">
                        <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                        {r.name}
                      </div>
                      {r.description && (
                        <div className="text-xs text-muted-foreground line-clamp-1 ml-5">{r.description}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </aside>

            {/* Chat */}
            <section className={`rounded-2xl border border-border bg-card flex flex-col ${activeRoom ? "" : "hidden md:flex"}`}>
              {activeRoom ? (
                <>
                  <header className="px-4 py-3 border-b border-border flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <button onClick={() => setActiveRoom(null)} className="md:hidden">
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <div className="min-w-0">
                        <h2 className="font-semibold truncate">{activeRoom.name}</h2>
                        {activeRoom.description && (
                          <p className="text-xs text-muted-foreground truncate">{activeRoom.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={copyCode}
                      className="text-xs flex items-center gap-1 px-2 py-1 rounded-full border border-border hover:bg-muted"
                      title="Copy invite code"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-safari-green" /> : <Copy className="h-3.5 w-3.5" />}
                      {activeRoom.invite_code}
                    </button>
                  </header>

                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[40vh] max-h-[60vh]">
                    {messages.length === 0 ? (
                      <p className="text-center text-sm text-muted-foreground mt-12">
                        No messages yet — say hi 👋
                      </p>
                    ) : (
                      messages.map((m) => {
                        const mine = m.user_id === user.id;
                        return (
                          <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[78%] rounded-2xl px-3.5 py-2 text-sm ${
                                mine
                                  ? "bg-safari-green text-primary-foreground rounded-br-sm"
                                  : "bg-muted text-foreground rounded-bl-sm"
                              }`}
                            >
                              {!mine && (
                                <div className="text-[11px] font-semibold opacity-80 mb-0.5">
                                  {m.display_name || "Member"}
                                </div>
                              )}
                              <div className="whitespace-pre-wrap break-words">{m.content}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSend();
                    }}
                    className="border-t border-border p-3 flex items-center gap-2"
                  >
                    <Input
                      placeholder="Message your group..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <Button type="submit" size="icon" className="gradient-safari border-0" disabled={!input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                  <div>
                    <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Select a room from the left, or create one to start chatting.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Looking for a family trip too? <Link to="/packages" className="text-safari-green underline">See Family packages</Link>.
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
};

export default GroupChatPage;
