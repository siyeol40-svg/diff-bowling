"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "./supabase";
import type { Participant, Room } from "./types";

interface RoomData {
  room: Room | null;
  participants: Participant[];
  loading: boolean;
  error: string | null;
}

/**
 * 방 코드로 방 + 참가자를 실시간 구독합니다.
 * 두 테이블의 INSERT/UPDATE/DELETE 가 모두 반영됩니다.
 */
export function useRoom(code: string | undefined): RoomData {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = useMemo(() => getSupabase(), []);

  useEffect(() => {
    if (!code) return;
    let active = true;

    async function load() {
      setLoading(true);
      setError(null);
      const { data: rooms, error: roomErr } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", code)
        .limit(1);
      if (!active) return;
      if (roomErr) {
        setError(roomErr.message);
        setLoading(false);
        return;
      }
      const r = (rooms?.[0] as Room | undefined) ?? null;
      setRoom(r);
      if (!r) {
        setLoading(false);
        return;
      }
      const { data: parts, error: partsErr } = await supabase
        .from("participants")
        .select("*")
        .eq("room_id", r.id)
        .order("created_at", { ascending: true });
      if (!active) return;
      if (partsErr) {
        setError(partsErr.message);
      }
      setParticipants((parts as Participant[]) ?? []);
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [code, supabase]);

  // 실시간 구독: 방 row + 참가자 행들
  useEffect(() => {
    if (!room) return;
    const channel = supabase
      .channel(`room-${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            setRoom(null);
            return;
          }
          setRoom(payload.new as Room);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setParticipants((prev) => [...prev, payload.new as Participant]);
          } else if (payload.eventType === "UPDATE") {
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === (payload.new as Participant).id
                  ? (payload.new as Participant)
                  : p,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setParticipants((prev) =>
              prev.filter((p) => p.id !== (payload.old as Participant).id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id, supabase]);

  return { room, participants, loading, error };
}
