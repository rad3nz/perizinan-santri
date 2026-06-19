import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { Check } from "lucide-react";
import { useState } from "react";

interface ApproveModalProps {
  opened: boolean;
  title?: string;
  onClose: () => void;
  onSubmit: (catatan?: string) => void;
  loading?: boolean;
}

export function ApproveModal({
  opened,
  title = "Setujui Perizinan",
  onClose,
  onSubmit,
  loading,
}: ApproveModalProps) {
  const [catatan, setCatatan] = useState("");
  const handleClose = () => {
    setCatatan("");
    onClose();
  };
  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={title}
      centered
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      <Stack>
        <Text size="sm">Setujui perizinan ini? Anda dapat menambahkan catatan (opsional).</Text>
        <Textarea
          label="Catatan (opsional)"
          placeholder="Catatan untuk santri…"
          rows={3}
          value={catatan}
          onChange={(e) => setCatatan(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose}>
            Batal
          </Button>
          <Button
            color="brand"
            leftSection={<Check size={16} strokeWidth={1.75} />}
            loading={loading}
            onClick={() => onSubmit(catatan.trim() || undefined)}
          >
            Setujui
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
