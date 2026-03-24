import { Close } from "@mui/icons-material";
import { Box, IconButton, Modal, Typography } from "@mui/material";
import Image from "next/image";
import { ComponentProps, ReactNode, useState } from "react";

export const ZoomableImage = ({
  modalTitle,
  modalText,
  imageProps,
}: {
  modalTitle: string;
  modalText: ReactNode;
  imageProps: ComponentProps<typeof Image>;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image {...imageProps} style={{ cursor: "zoom-in" }} onClick={() => setModalOpen(true)} />
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        sx={{ zIndex: 9999999, height: "100%" }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            maxHeight: "90vh",
            maxWidth: imageProps.width,
            width: "fit-content",
            height: "auto",
            bgcolor: "background.paper",
            boxShadow: 24,
            textAlign: "center",
            p: 0,
            display: "block",
          }}
          className="rounded-xl border"
        >
          <IconButton
            onClick={() => setModalOpen(false)}
            size="small"
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <Close />
          </IconButton>
          <Typography variant="h5" className="p-4" sx={{ maxWidth: imageProps.width }}>
            {modalTitle}
          </Typography>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image {...imageProps} style={{ margin: 0 }} />
          <Typography
            variant="body2"
            className="p-4 whitespace-pre-wrap"
            sx={{ maxWidth: imageProps.width }}
          >
            {modalText}
          </Typography>
        </Box>
      </Modal>
    </>
  );
};
