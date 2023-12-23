import { Box, Button, Dialog, DialogActions, DialogContent, TextField, Typography } from '@mui/material';
import React from 'react';
import './SectorTypeDialog.scss';

function SectorTypeDialog({isSectorDialogOpen, setSectorDialogOpen, handleSectorSubmit, setSectorType, sectorType}) {
    return (
        <Dialog open={isSectorDialogOpen} onClose={() => setSectorDialogOpen(false)} className="sector-dialog">
            <DialogContent>
                <Box className="title">
                    <Typography>What is your targeted industry?</Typography>
                </Box>
                <TextField
                    autoFocus
                    type="text"
                    fullWidth
                    variant="standard"
                    value={sectorType}
                    onChange={(e) => setSectorType(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSectorSubmit}>Submit</Button>
            </DialogActions>
        </Dialog>
    )
}

export default SectorTypeDialog;