"use client";
import { useEffect, useState, useRef } from "react";
import { Box, Stack, Typography, Button, Modal, TextField, ThemeProvider, createTheme, IconButton } from "@mui/material";
import { firestore } from "@/firebase";
import { collection, deleteDoc, doc, getDocs, query, setDoc, getDoc } from "firebase/firestore";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Camera } from "react-camera-pro";
import axios from 'axios';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    secondary: { main: '#f48fb1' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#c7c7c7',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h3: { fontWeight: 600 },
    h5: { fontWeight: 500 },
  },
});

export default function Home() {
  const [itemName, setItemName] = useState('');
  const [searchWord, setSearchWord] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [openCamera, setOpenCamera] = useState(false);

  const camera = useRef(null);
  const [image, setImage] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleOpenCamera = () => setOpenCamera(true);
  
  const handleCloseCamera = async () => {
    setOpenCamera(false);
    if (image) {
      try {
        const response = await axios.post('/api/get-item-name', { imageUrl: image });
        addItem(response.data.name);
      } catch (error) {
        console.error("Error with API call:", error);
      }
    }
    setImage(null);
  };

  const updateItems = async () => {
    const items = [];
    try {
      const snapshot = query(collection(firestore, 'pantry'));
      const docs = await getDocs(snapshot);
      docs.forEach((doc) => {
        items.push({ name: doc.id, ...doc.data() });
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      const results = items.filter(({ name }) =>
        name.toLowerCase().includes(searchWord.toLowerCase())
      );
      setSearchResults(results);
    }
  };

  useEffect(() => {
    updateItems();
  }, [searchWord]);

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'pantry'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { count } = docSnap.data();
        await setDoc(docRef, { count: count + 1 });
      } else {
        await setDoc(docRef, { count: 1 });
      }
      await updateItems();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'pantry'), item);
      const docSnap = await getDoc(docRef);
      const { count } = docSnap.data();
      if (count > 1) {
        await setDoc(docRef, { count: count - 1 });
      } else {
        await deleteDoc(docRef);
      }
      await updateItems();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        width="100vw"
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        flexDirection="column"
        alignItems="center"
        bgcolor="background.default"
        p={2}
      >
        <Box
          width="800px"
          display="flex"
          justifyContent="space-between"
          mb={2}
          spacing={20}
        >
          <TextField
            id="outlined-basic"
            label="Search an Item"
            variant="outlined"
            fullWidth
            onChange={(e) => setSearchWord(e.target.value)}
            InputProps={{
              style: { color: 'text.primary' },
            }}
            InputLabelProps={{
              style: { color: 'text.secondary', paddingRight: '10px' },
            }}
            sx={{ paddingRight: '10px' }}
          />
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Add
          </Button>
          <IconButton
            color="primary"
            sx={{ padding: '10px 20px', marginLeft: '10px' }}
            onClick={handleOpenCamera}
          >
            <AddPhotoAlternateIcon />
          </IconButton>
        </Box>

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 400,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
              color: 'text.primary',
            }}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Add Item
            </Typography>
            <Stack spacing={2}>
              <TextField
                id="outlined-basic"
                label="Insert an Item"
                variant="outlined"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                fullWidth
                InputProps={{
                  style: { color: 'text.primary' },
                }}
                InputLabelProps={{
                  style: { color: 'text.secondary' },
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  addItem(itemName);
                  handleClose();
                  setItemName('');
                }}
              >
                Add
              </Button>
            </Stack>
          </Box>
        </Modal>

        <Modal
          open={openCamera}
          onClose={handleCloseCamera}
          aria-labelledby="camera-modal-title"
          aria-describedby="camera-modal-description"
        >
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: 500,
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
              color: 'text.primary',
              textAlign: 'center',
            }}
          >
            <Typography id="camera-modal-title" variant="h6" component="h2" mb={2}>
              Take a Picture
            </Typography>
            <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" mb={2}>
              {!image && (
                <Camera
                  ref={camera}
                  aspectRatio={4 / 3}
                  facingMode="environment"
                  onError={(error) => {
                    console.error("Camera error:", error);
                    setImage(null);
                  }}
                />
              )}
              {image && (
                <Box mt={2}>
                  <img src={image} alt="Captured" width="100%" />
                </Box>
              )}
            </Box>
            <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column">
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (image) {
                  setImage(null);  // Reset the image if already taken
                } else {
                  try {
                    const photo = camera.current.takePhoto();
                    setImage(photo);
                  } catch (error) {
                    console.error("Error taking photo:", error);
                  }
                }
              }}
              sx={{ mb: 2 }}
            >
              {image ? "Retake Picture" : "Take Picture"}
            </Button>

            {image && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleCloseCamera();
                }}
              >
                Add Item
              </Button>
            )}
            </Box>
          </Box>
        </Modal>



        <Box
          border="1px solid #333"
          borderRadius={2}
          p={2}
          width="800px"
          bgcolor="background.paper"
        >
          <Box
            mb={2}
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
          >
            <Typography variant="h3" color="primary">
              Inventory Tracker
            </Typography>
          </Box>

          <Stack
            spacing={2}
            overflow="auto"
            height="500px"
            sx={{
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            {searchResults.map(({ name, count }) => (
              <Box
                key={name}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                p={2}
                bgcolor="primary.main"
                borderRadius={1}
                color="black"
              >
                <Typography variant="h5" component="div">
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography variant="h5" component="div">
                  Quantity: {count}
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => removeItem(name)}
                >
                  Remove
                </Button>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
