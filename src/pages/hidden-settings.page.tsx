import { withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ContentCopy, Delete } from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { type MRT_ColumnDef, MaterialReactTable } from "material-react-table";
import Head from "next/head";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PersonalAccessToken, createPersonalAccessTokenInput } from "@/common/personalAccessToken";
import { QueryError } from "@/web/common/components/Error/Error";
import { Loading } from "@/web/common/components/Loading/Loading";
import { trpc } from "@/web/common/trpc";

const columns: MRT_ColumnDef<PersonalAccessToken>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    Cell: ({ row }) => (
      <span title={row.original.createdAt.toLocaleString()}>
        {row.original.createdAt.toLocaleDateString()}
      </span>
    ),
    grow: false,
  },
  {
    accessorKey: "lastUsedAt",
    header: "Last used",
    Cell: ({ row }) =>
      row.original.lastUsedAt ? (
        <span title={row.original.lastUsedAt.toLocaleString()}>
          {row.original.lastUsedAt.toLocaleDateString()}
        </span>
      ) : (
        <span className="text-gray-400">Never</span>
      ),
    grow: false,
  },
  {
    accessorKey: "expiresAt",
    header: "Expires",
    Cell: ({ row }) =>
      row.original.expiresAt ? (
        <span title={row.original.expiresAt.toLocaleString()}>
          {row.original.expiresAt.toLocaleDateString()}
        </span>
      ) : (
        <span className="text-gray-400">Never</span>
      ),
    grow: false,
  },
  {
    id: "status",
    header: "Status",
    Cell: ({ row }) => <StatusChip status={getTokenStatus(row.original)} />,
    grow: false,
  },
];

// default exported at bottom of file (wanted to name the component so couldn't default export inline)
const HiddenSettingsPage = withPageAuthRequired(() => {
  const utils = trpc.useUtils();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [revealedToken, setRevealedToken] = useState<string | null>(null);
  const [tokenPendingRevocation, setTokenPendingRevocation] = useState<PersonalAccessToken | null>(
    null,
  );

  const listTokens = trpc.personalAccessToken.list.useQuery();

  const revokeToken = trpc.personalAccessToken.revoke.useMutation({
    onSuccess: () => {
      setIsRevokeDialogOpen(false);
      void utils.personalAccessToken.list.invalidate();
    },
  });

  if (listTokens.isLoading) return <Loading />;
  if (listTokens.error) return <QueryError error={listTokens.error} />;

  return (
    <>
      <Head>
        <title>Hidden Settings | Ameliorate</title>
        <meta name="description" content="Manage your account's hidden settings." />
      </Head>

      <div className="mx-auto max-w-4xl p-4">
        <Typography variant="h5" className="mb-4">
          Settings
        </Typography>

        <Typography variant="h6" className="mb-2">
          Personal Access Tokens
        </Typography>

        <Typography variant="body2" className="mb-3 text-gray-600">
          Personal access tokens are for developer use - <b>proceed with caution.</b>
        </Typography>

        <Typography variant="body2" className="mb-3 text-gray-600">
          These tokens are effectively a username + password for taking actions on your behalf via
          the Ameliorate API, so treat them like secrets. See the{" "}
          <a
            href="https://github.com/amelioro/ameliorate/blob/main/src/api/README.md#using-authenticated-endpoints"
            className="underline"
          >
            API docs
          </a>{" "}
          for usage instructions.
        </Typography>

        {revealedToken && (
          <TokenRevealBanner plaintext={revealedToken} onDismiss={() => setRevealedToken(null)} />
        )}

        <div className="mb-3">
          <Button variant="contained" onClick={() => setCreateDialogOpen(true)}>
            Create token
          </Button>
        </div>

        <MaterialReactTable
          columns={columns}
          data={listTokens.data}
          layoutMode="grid"
          enableRowActions={true}
          renderRowActions={({ row }) => {
            const status = getTokenStatus(row.original);
            if (status !== "active") return null;

            return (
              <Tooltip title="Revoke token">
                <IconButton
                  onClick={() => {
                    setTokenPendingRevocation(row.original);
                    setIsRevokeDialogOpen(true);
                  }}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            );
          }}
          positionActionsColumn="last"
          enableToolbarInternalActions={false}
          enableTopToolbar={false}
          initialState={{
            sorting: [{ id: "createdAt", desc: true }],
          }}
        />

        <CreateTokenDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onCreated={(plaintext) => {
            setRevealedToken(plaintext);
            setCreateDialogOpen(false);
            void utils.personalAccessToken.list.invalidate();
          }}
        />

        <RevokeTokenDialog
          errorMessage={revokeToken.error?.message}
          isLoading={revokeToken.isLoading}
          onClose={() => setIsRevokeDialogOpen(false)}
          onConfirm={() => {
            if (!tokenPendingRevocation) return;

            revokeToken.mutate({ id: tokenPendingRevocation.id });
          }}
          // separate from onclose so that the dialog doesn't flicker an empty token name before the dialog fully closes
          onExited={() => {
            setTokenPendingRevocation(null);
            revokeToken.reset();
          }}
          open={isRevokeDialogOpen}
          token={tokenPendingRevocation}
        />
      </div>
    </>
  );
});

type TokenStatus = "active" | "expired" | "revoked";

const createTokenFormSchema = createPersonalAccessTokenInput.pick({ name: true }).extend({
  daysUntilExpiry: z.number().positive("Days until expiry must be positive").optional(),
});

const getTokenStatus = (token: PersonalAccessToken): TokenStatus => {
  if (token.revokedAt) return "revoked";
  if (token.expiresAt && token.expiresAt <= new Date()) return "expired";
  return "active";
};

const StatusChip = ({ status }: { status: TokenStatus }) => {
  const colorMap: Record<TokenStatus, "success" | "error" | "default"> = {
    active: "success",
    expired: "error",
    revoked: "default",
  };

  return <Chip label={status} color={colorMap[status]} size="small" />;
};

type CreateTokenFormData = z.infer<typeof createTokenFormSchema>;

interface CreateTokenDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (plaintext: string) => void;
}

const CreateTokenDialog = ({ open, onClose, onCreated }: CreateTokenDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CreateTokenFormData>({
    resolver: zodResolver(createTokenFormSchema),
    mode: "onBlur",
  });

  const createToken = trpc.personalAccessToken.create.useMutation({
    onSuccess: (data: { plaintext: string }) => {
      onCreated(data.plaintext);
      reset();
    },
  });

  const onSubmit = (data: CreateTokenFormData) => {
    const expiresAt =
      data.daysUntilExpiry === undefined
        ? null
        : new Date(Date.now() + data.daysUntilExpiry * 24 * 60 * 60 * 1000); // `new Date()` accepts milliseconds

    createToken.mutate({ name: data.name, expiresAt });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <DialogTitle>Create Personal Access Token</DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="mt-2">
            <TextField
              {...register("name")}
              label="Token name"
              placeholder="e.g. CI runner, local automation"
              error={!!errors.name}
              helperText={errors.name?.message}
              slotProps={{ htmlInput: { maxLength: 100 } }}
              fullWidth
              required
            />
            <TextField
              {...register("daysUntilExpiry", {
                setValueAs: (value: string) => {
                  if (!value) return undefined;

                  return Number(value);
                },
              })}
              label="Days until expiry"
              type="number"
              error={!!errors.daysUntilExpiry}
              helperText={
                errors.daysUntilExpiry?.message ?? "Leave blank for a token that never expires."
              }
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
              fullWidth
            />
            {createToken.error && <Alert severity="error">{createToken.error.message}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" type="submit" disabled={!isValid || createToken.isLoading}>
            Create
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

interface RevokeTokenDialogProps {
  errorMessage?: string;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onExited: () => void;
  open: boolean;
  token: PersonalAccessToken | null;
}

const RevokeTokenDialog = ({
  errorMessage,
  isLoading,
  onClose,
  onConfirm,
  onExited,
  open,
  token,
}: RevokeTokenDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ transition: { onExited } }}
    >
      <DialogTitle>Revoke personal access token?</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="mt-2">
          <Typography variant="body2">
            <strong>{token?.name}</strong> will be revoked.
          </Typography>
          <Typography variant="body2">
            Any applications using this token will no longer be able to access the Ameliorate API.
            You cannot undo this action.
          </Typography>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={isLoading}>
          Revoke token
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface TokenRevealBannerProps {
  plaintext: string;
  onDismiss: () => void;
}

const TokenRevealBanner = ({ plaintext, onDismiss }: TokenRevealBannerProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(plaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Alert severity="success" onClose={onDismiss} className="mb-4">
      <Typography variant="subtitle2" className="mb-1">
        Your new token has been created. Copy it now — it won{"'"}t be shown again.
      </Typography>
      <Paper variant="outlined" className="flex items-center gap-2 p-2">
        <code className="flex-1 overflow-x-auto text-sm break-all">{plaintext}</code>
        <Tooltip title={copied ? "Copied!" : "Copy token"}>
          <IconButton size="small" onClick={handleCopy}>
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
      </Paper>
    </Alert>
  );
};

export default HiddenSettingsPage;
