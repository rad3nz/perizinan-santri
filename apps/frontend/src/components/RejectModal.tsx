import { Button, Group, Modal, Stack, Textarea } from "@mantine/core";
import { useState } from "react";

interface RejectModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (alasanPenolakan: string) => void;
  loading?: boolean;
}

export function RejectModal({ opened, onClose, onSubmit, loading }: RejectModalProps) {
  const [alasan, setAlasan] = useState("");
  const canSubmit = alasan.trim().length > 0;

  const handleClose = () => {
    setAlasan("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Tolak Perizinan"
      centered
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      <Stack>
        <Textarea
          label="Alasan penolakan"
          placeholder="Tuliskan alasan penolakan"
          required
          rows={4}
          value={alasan}
          onChange={(e) => setAlasan(e.currentTarget.value)}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={handleClose}>
            Batal
          </Button>
          <Button
            color="red"
            disabled={!canSubmit}
            loading={loading}
            onClick={() => onSubmit(alasan.trim())}
          >
            Tolak
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
