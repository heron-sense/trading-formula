import { DatePicker } from "@mui/lab";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import {
  Checkbox,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  styled,
} from "@mui/material";
import {H4} from "app/components/Typography";
import React,{ useEffect, useState } from "react";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
 import { useNavigate } from 'react-router-dom';
import { Button, Container, Form, FormGroup, Input, Label} from 'reactstrap';

const TextField = styled(TextValidator)(() => ({
  width: "100%",
  marginBottom: "16px",
}));

const MemberSetup = () => {
  const [state, setState] = useState({ date: new Date() });

  useEffect(() => {
    ValidatorForm.addValidationRule("isPasswordMatch", (value) => {
      if (value !== state.password) return false;

      return true;
    });
    return () => ValidatorForm.removeValidationRule("isPasswordMatch");
  }, [state.password]);



  const handleChange = (event) => {
    event.persist();
    setState({ ...state, [event.target.name]: event.target.value });
  };

  const handleDateChange = (date) => setState({ ...state, date });

  const {
    username,
    firstName,
    creditCard,
    mobile,
    password,
    confirmPassword,
    gender,
    date,
    email,
  } = state;


  const handleSubmit = async (event) => {
    console.log(event);
    event.preventDefault();
    await fetch('http://localhost:5000/members/create', {
    method: 'POST',
        headers: {
      'Accept': 'application/json',
          'Content-Type': 'application/json'
    },
    body: JSON.stringify({"user":"heron-sense"})
  })
.then(res => {
    if (res.status === 200) {
      //message.success('Login success.')
      res.json().then(data =>{
        localStorage.setItem('token',data.token)
      })
    }
  })
      .catch(err =>{
        console.log(err)
       // message.error('Login failed')
      })
  ;

  //setUser(initialFormState);
  //navigate(url);
}

  return (
    <div>
      <ValidatorForm onSubmit={handleSubmit} onError={() => null}>
        <H4>Account Information</H4>
        <div>
          <Grid container spacing={6}>
            <Grid item lg={4} md={4} sm={12} xs={12} sx={{ mt: 1 }}>
              <TextField
                  type="text"
                  name="username"
                  id="standard-basic"
                  value={username || ""}
                  onChange={handleChange}
                  errorMessages={["this field is required"]}
                  label="Username (Min length 4, Max length 9)"
                  validators={["required", "minStringLength: 4", "maxStringLength: 9"]}
              />

              <TextField
                  type="text"
                  name="firstName"
                  label="First Name"
                  onChange={handleChange}
                  value={firstName || ""}
                  validators={["required"]}
                  errorMessages={["this field is required"]}
              />

              <TextField
                  type="email"
                  name="email"
                  label="Email"
                  value={email || ""}
                  onChange={handleChange}
                  validators={["required", "isEmail"]}
                  errorMessages={["this field is required", "email is not valid"]}
              />

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                    value={date}
                    onChange={handleDateChange}
                    renderInput={(props) => (
                        <TextField
                            {...props}
                            label="Date picker"
                            id="mui-pickers-date"
                            sx={{ mb: 2, width: "100%" }}
                        />
                    )}
                />
              </LocalizationProvider>

              <TextField
                  sx={{ mb: 4 }}
                  type="number"
                  name="creditCard"
                  label="Credit Card"
                  onChange={handleChange}
                  value={creditCard || ""}
                  errorMessages={["this field is required"]}
                  validators={["required", "minStringLength:16", "maxStringLength: 16"]}
              />
            </Grid>
          </Grid>
        </div>

        <H4>Role & Permission</H4>
        <Grid container spacing={12}>
          <Grid item lg={12} md={12} sm={12} xs={12} sx={{ mt: 1 }}>
            <TextField
                type="text"
                name="mobile"
                value={mobile || ""}
                label="Mobile Nubmer"
                onChange={handleChange}
                validators={["required"]}
                errorMessages={["this field is required"]}
            />
            <TextField
                name="password"
                type="password"
                label="Password"
                value={password || ""}
                onChange={handleChange}
                validators={["required"]}
                errorMessages={["this field is required"]}
            />
            <TextField
                type="password"
                name="confirmPassword"
                onChange={handleChange}
                label="Confirm Password"
                value={confirmPassword || ""}
                validators={["required", "isPasswordMatch"]}
                errorMessages={["this field is required", "password didn't match"]}
            />
            <RadioGroup
                row
                name="gender"
                sx={{ mb: 2 }}
                value={gender || ""}
                onChange={handleChange}
            >
              <FormControlLabel
                  value="Male"
                  label="Male"
                  labelPlacement="end"
                  control={<Radio color="secondary" />}
              />

              <FormControlLabel
                  value="Female"
                  label="Female"
                  labelPlacement="end"
                  control={<Radio color="secondary" />}
              />

              <FormControlLabel
                  value="Others"
                  label="Others"
                  labelPlacement="end"
                  control={<Radio color="secondary" />}
              />
            </RadioGroup>

            <FormControlLabel
                control={<Checkbox />}
                label="I have read and agree to the terms of service."
            />
          </Grid>
        </Grid>
      </ValidatorForm>
    </div>
  );
};

export default MemberSetup;
