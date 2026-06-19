import { Button, Group, Modal, SegmentedControl, Stack, Textarea } from "@mantine/core";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";

type Decision = "approve" | "reject";

interface EditApprovalModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (decision: Decision, note?: string) => void;
  loading?: boolean;
  initialDecision: Decision;
  initialNote?: string | null;
}

export function EditApprovalModal({
  opened,
  onClose,
  onSubmit,
  loading,
  initialDecision,
  initialNote,
}: EditApprovalModalProps) {
  const [decision, setDecision] = useState<Decision>(initialDecision);
  const [note, setNote] = useState(initialNote ?? "");

  // Re-seed from the row each time the modal opens (the same component instance is
  // reused across rows, so stale local state would otherwise leak between them).
  useEffect(() => {
    if (opened) {
      setDecision(initialDecision);
      setNote(initialNote ?? "");
    }
  }, [opened, initialDecision, initialNote]);

  const isReject = decision === "reject";
  const canSubmit = !isReject || note.trim().length > 0;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Persetujuan"
      centered
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      <Stack>
        <SegmentedControl
          fullWidth
          color={isReject ? "red" : "brand"}
          value={decision}
          onChange={(value) => setDecision(value as Decision)}
          data={[
            { label: "Setujui", value: "approve" },
            { label: "Tolak", value: "reject" },
          ]}
        />
        <Textarea
          label={isReject ? "Alasan penolakan" : "Catatan (opsional)"}
          placeholder={isReject ? "Tuliskan alasan penolakan" : "Catatan untuk santri…"}
          required={isReject}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Batal
          </Button>
          <Button
            color={isReject ? "red" : "brand"}
            disabled={!canSubmit}
            loading={loading}
            leftSection={<Pencil size={16} strokeWidth={1.75} />}
            onClick={() => onSubmit(decision, note.trim() || undefined)}
          >
            Simpan
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
