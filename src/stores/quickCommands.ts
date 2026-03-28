import { defineStore } from "pinia";
import apiClient from "../services/http";

export type QuickCommandScope = "all" | "server";

export interface QuickCommandServer {
  id: number;
  name: string;
  env?: string;
  host?: string;
  status?: string;
}

export interface QuickCommand {
  id: number;
  label: string;
  command: string;
  scope: QuickCommandScope;
  serverId: number | null;
  server?: QuickCommandServer | null;
  icon?: string | null;
  sortOrder: number;
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuickCommandDto {
  label: string;
  command: string;
  scope: QuickCommandScope;
  serverId?: number | null;
  icon?: string;
  sortOrder?: number;
}

const normalize = (commands: QuickCommand[]) =>
  [...commands].sort((a, b) => {
    if (a.sortOrder === b.sortOrder) {
      return a.id - b.id;
    }
    return a.sortOrder - b.sortOrder;
  });

export const useQuickCommandsStore = defineStore("quickCommands", {
  state: () => ({
    commands: [] as QuickCommand[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    forServer: (state) => (serverId: number | null) => {
      if (!serverId) {
        return normalize(state.commands.filter((c) => c.scope === "all"));
      }

      return normalize(
        state.commands.filter(
          (c) =>
            c.scope === "all" ||
            (c.scope === "server" && c.serverId === serverId),
        ),
      );
    },

    systemCommands: (state) =>
      normalize(state.commands.filter((c) => c.isSystem)),

    userCommands: (state) =>
      normalize(state.commands.filter((c) => !c.isSystem)),
  },

  actions: {
    async fetchAll() {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await apiClient.get("/quick-commands");
        this.commands = normalize(data);
      } catch (err: any) {
        this.error =
          err?.response?.data?.message || "Failed to load quick commands";
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchForServer(serverId: number) {
      const { data } = await apiClient.get(
        `/quick-commands/for-server/${serverId}`,
      );

      const byId = new Map<number, QuickCommand>();
      this.commands.forEach((cmd) => byId.set(cmd.id, cmd));
      data.forEach((cmd: QuickCommand) => byId.set(cmd.id, cmd));
      this.commands = normalize(Array.from(byId.values()));

      return data as QuickCommand[];
    },

    async create(dto: CreateQuickCommandDto) {
      const { data } = await apiClient.post("/quick-commands", dto);
      this.commands = normalize([...this.commands, data]);
      return data as QuickCommand;
    },

    async update(id: number, dto: Partial<CreateQuickCommandDto>) {
      const { data } = await apiClient.patch(`/quick-commands/${id}`, dto);
      const next = [...this.commands];
      const idx = next.findIndex((c) => c.id === id);
      if (idx !== -1) {
        next[idx] = data;
        this.commands = normalize(next);
      }
      return data as QuickCommand;
    },

    async remove(id: number) {
      await apiClient.delete(`/quick-commands/${id}`);
      this.commands = this.commands.filter((c) => c.id !== id);
    },

    async reorder(orderedIds: number[]) {
      await apiClient.patch("/quick-commands/reorder/batch", { orderedIds });

      const orderById = new Map<number, number>();
      orderedIds.forEach((id, index) => orderById.set(id, index));

      this.commands = normalize(
        this.commands.map((cmd) => ({
          ...cmd,
          sortOrder: orderById.get(cmd.id) ?? cmd.sortOrder,
        })),
      );
    },
  },
});
