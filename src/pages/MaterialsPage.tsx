import {
    Button,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import paperStyles from '../styles/Paper.module.css';
import commonStyles from '../styles/Common.module.css';
import { useEffect, useState } from 'react';
import type { MaterialDto } from '../dto/materials.ts';
import { MaterialsApiClient } from '../api/materialsApiClient.ts';

const MaterialsPage = () => {
    const theme = useTheme();
    const [page, setPage] = useState<number>(0);
    const [total, setTotal] = useState<number>(0);
    const [entries, setEntries] = useState<MaterialDto[]>([]);

    useEffect(() => {
        MaterialsApiClient.get(page).then((materialsList) => {
            if (!materialsList) {
                // TODO: add toast
            } else {
                setEntries(materialsList.entries);
                setTotal(materialsList.total);
            }
        });
    }, [page]);

    return (
        <Paper
            className={`${paperStyles.paper} ${commonStyles.flexColumn}`}
            style={{ gap: theme.spacing(4), borderRadius: '10px' }}
        >
            {/* Page name and button */}
            <Grid
                container
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                style={{ gap: theme.spacing(4) }}
            >
                <Grid>
                    <Typography variant="h2">Каталог матеріалів</Typography>
                </Grid>
                <Grid>
                    <Button
                        style={{ marginBottom: theme.spacing(1) }}
                        variant="contained"
                        color="primary"
                    >
                        Новий матеріал
                    </Button>
                </Grid>
            </Grid>

            {/* Data table */}
            <TableContainer
                style={{
                    minWidth: '350px',
                    maxHeight: '500px',
                    overflow: 'auto',
                    paddingRight: '10px',
                    boxSizing: 'content-box',
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell
                                style={{ backgroundColor: '#b7cfd2', borderTopLeftRadius: 10 }}
                                width="80px"
                            >
                                ID
                            </TableCell>
                            <TableCell style={{ backgroundColor: '#b7cfd2' }} width="600px">
                                Назва
                            </TableCell>
                            <TableCell
                                style={{ backgroundColor: '#b7cfd2', borderTopRightRadius: 10 }}
                            >
                                Вартість (грн за гр.)
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {entries?.map((material) => (
                            <TableRow key={material.id}>
                                <TableCell>
                                    <Typography variant="body2">{material.id}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{material.name}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{material.price}</Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                count={total}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPageOptions={[]}
                page={page}
                rowsPerPage={10}
                style={{
                    marginTop: theme.spacing(4),
                    border: 0,
                }}
            />
        </Paper>
    );
};

export default MaterialsPage;
