import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";

interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  confirmColor?: string;
}

export function ConfirmModal({
  opened,
  onClose,
  onConfirm,
  loading,
  title,
  message,
  confirmLabel,
  confirmColor = "brand",
}: ConfirmModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      <Stack>
        <Text size="sm">{message}</Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Batal
          </Button>
          <Button color={confirmColor} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
