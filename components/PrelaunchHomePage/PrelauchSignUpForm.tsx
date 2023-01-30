import { Box, Button, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input } from '@chakra-ui/react'
import axios from 'axios';
import { useRef, useState } from 'react'

const PrelaunchSignUpForm = () => {
  const [email, setEmail] = useState("");
  const [state, setState] = useState("IDLE");
  const [errorMessage, setErrorMessage] = useState(null);

  const subscribe = async (e: any) => {
    e.preventDefault()
    setState("LOADING");
    setErrorMessage(null);
    try {
      const response = await axios.post("/api/subscribe", { email });
      setState("SUCCESS");
    } catch (e: any) {
      setErrorMessage(e.response.data.error);
      setState("ERROR");
    }
  };
    return (
      <form onSubmit={subscribe}>
      <FormControl isRequired>
        <FormLabel htmlFor="email-input">
          Your Best Email
        </FormLabel>

        <Input type='email'  value={email} onChange={(e) => setEmail(e.target.value)} />
    
        <FormErrorMessage>Email is required.</FormErrorMessage>

        <Button type="submit" value="" name="subscribe">
          Subscribe
        </Button>
      </FormControl>
      </form>
    )

}

export default PrelaunchSignUpForm