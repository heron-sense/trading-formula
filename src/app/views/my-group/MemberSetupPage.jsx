import { Stack } from '@mui/material';
import { Box, styled } from '@mui/material';
import { Breadcrumb, SimpleCard } from 'app/components';
import MemberSetup from './MemberSetup';
import Button from "@mui/material/Button";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";
import React from "react";
import './MemberSetup.css'; // 导入样式文件

function getSteps() {
    return ["Fill in account information", "Role & Permission setup", "Create an ad"];
}

function getStepContent(stepIndex) {
    switch (stepIndex) {
        case 0:
            return `Lorem ipsum dolor sit amet, consectetur  In a ullamcorp vi dictum turpis quam, at feugiat mi elementum a.`;

        case 1:
            return `Integer euismod dapibus sapien, a interdum aug ipsum et sapien cursus, eu mattis augue ornare.`;

        case 2:
            return `In laoreet, dui vel tristique f  magn  Etiam viverra. Nulla consectetur  s risus ipsum sed eros.`;

        default:
            return `Aenean arcu ligula, portti a ut tempor commodo, per conubia nostra, per inceptos himenaeos. Etiam in commodo mauris. Ut iaculis ipsum velit.`;
    }
}


const Container = styled('div')(({ theme }) => ({
  margin: '30px',
  [theme.breakpoints.down('sm')]: { margin: '16px' },
  '& .breadcrumb': {
    marginBottom: '30px',
    [theme.breakpoints.down('sm')]: { marginBottom: '16px' }
  }
}));

const MemberSetupPage = () => {
    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps();

    const handleNext = () => setActiveStep((prevActiveStep) => prevActiveStep + 1);

    const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);

    const handleReset = () => setActiveStep(0);

  return (
    <Container>
      <Box className="breadcrumb">
        <Breadcrumb routeSegments={[{ name: 'My Group', path: '/my-group' }, { name: 'Member Setup' }]} />
      </Box>

      <Stack spacing={2}>
          <SimpleCard title="Member Setup">
              <br/>
              <div>
                  <Stepper activeStep={activeStep} alternativeLabel>
                      {steps.map((label) => (
                          <Step key={label}>
                              <StepLabel>{label}</StepLabel>
                          </Step>
                      ))}
                  </Stepper>
              </div>


          <MemberSetup />
        </SimpleCard>
          <Box mt={4}>
              {activeStep === steps.length ? (
                  <Box>
                      <Typography>All steps completed</Typography>

                      <Button sx={{ mt: 2 }} variant="contained" color="secondary" onClick={handleReset}>
                          Reset
                      </Button>
                  </Box>
              ) : (
                  <Box>
                      <Typography>{getStepContent(activeStep)}</Typography>

                      <Box pt={2}>
                          <Button
                              variant="contained"
                              color="secondary"
                              disabled={activeStep === 0}
                              onClick={handleBack}
                          >
                              Back
                          </Button>

                          <Button sx={{ ml: 2 }} variant="contained" color="primary" onClick={handleNext}>
                              {activeStep === steps.length - 1 ? "Finish" : "Next"}
                          </Button>
                      </Box>
                  </Box>
              )}
          </Box>
      </Stack>
    </Container>
  );
};

export default MemberSetupPage;
