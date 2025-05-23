import { Stack } from '@mui/material';
import { Box, styled } from '@mui/material';
import { Breadcrumb, SimpleCard } from 'app/components';
import AddClientForm from './AddClientForm';
import React,{ useEffect, useState } from "react";


const Container = styled('div')(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' }
  }
}));


const UpdateClientInfoTemplate = () => {
  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: 'Material', path: '/material' }, { name: 'Form' }]} />
      </Box>

      <Stack spacing={3}>
        <SimpleCard title="Simple Form">
          <AddClientForm />
        </SimpleCard>
      </Stack>
    </Container>
  );
};

export default UpdateClientInfoTemplate;
