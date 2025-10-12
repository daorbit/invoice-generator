/**
 * Line items section
 */

import React from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Stack,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { InvoiceItem } from "../../types/invoice";
import { QuotationItem } from "../../types/quotation";

interface LineItemsProps {
  items: (InvoiceItem | QuotationItem)[];
  currency: string;
  themeColor: string;
  onItemChange: (
    id: string,
    field: keyof InvoiceItem | keyof QuotationItem,
    value: string | number
  ) => void;
  onDeleteItem: (id: string) => void;
  onAddItem: () => void;
}

export const LineItems: React.FC<LineItemsProps> = ({
  items,
  currency,
  themeColor,
  onItemChange,
  onDeleteItem,
  onAddItem,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="overline"
        sx={{
          color: themeColor,
          fontWeight: 700,
          fontSize: "10px",
          letterSpacing: "1.5px",
          display: "block",
          mb: 1.5,
        }}
      >
        LINE ITEMS
      </Typography>
      {items.map((item, index) => (
        <Box
          key={item.id}
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 1,
            border: "1px solid #e0e0e0",
          }}
        >
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#666", fontSize: "0.8125rem" }}
            >
              Item #{index + 1}
            </Typography>
            {items.length > 1 && (
              <IconButton
                size="small"
                onClick={() => onDeleteItem(item.id)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              label="Description"
              value={item.description}
              onChange={(e) =>
                onItemChange(item.id, "description", e.target.value)
              }
              multiline
              rows={2}
              size="small"
              placeholder="Product or service description..."
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              <TextField
                label="Qty"
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  onItemChange(
                    item.id,
                    "quantity",
                    parseFloat(e.target.value) || 0
                  )
                }
                size="small"
                sx={{ width: { xs: "calc(50% - 6px)", sm: "100px" } }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                label="Rate"
                type="number"
                value={item.rate}
                onChange={(e) =>
                  onItemChange(item.id, "rate", parseFloat(e.target.value) || 0)
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{currency}</InputAdornment>
                  ),
                }}
                size="small"
                sx={{ flex: { xs: "1 1 calc(50% - 6px)", sm: 1 } }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              <TextField
                label="Amount"
                type="number"
                value={item.amount}
                disabled
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">{currency}</InputAdornment>
                  ),
                }}
                size="small"
                sx={{
                  flex: { xs: "1 1 100%", sm: 1 },
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: themeColor,
                    fontWeight: 600,
                  },
                }}
              />
            </Box>
          </Stack>
        </Box>
      ))}
      <Button
        fullWidth
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={onAddItem}
        sx={{
          py: 1,
          borderStyle: "dashed",
          "&:hover": {
            borderStyle: "dashed",
          },
        }}
      >
        Add Item
      </Button>
    </Box>
  );
};
