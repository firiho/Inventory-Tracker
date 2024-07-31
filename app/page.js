"use client";
import { useEffect, useState } from "react";
import { Box, Stack, Typography, Button, Modal, TextField } from "@mui/material";
import { firestore } from "@/firebase";
import { collection, count, deleteDoc, doc, getDocs, query, setDoc, getDoc} from "firebase/firestore";

export default function Home() {

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'black',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    alignContent: 'center',
    alignItems: 'center',
    gap: 2,
  };

  const [itemList, setItemList] = useState([]);
  const [itemName, setItemName] = useState('');

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const updateItems = async () => {
    const items = [];
    try {
      const snapshot = query(collection(firestore, 'pantry'));
      const docs = await getDocs(snapshot);
      docs.forEach((doc) => {
        items.push({name: doc.id, ...doc.data()});
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
    finally {
      setItemList(items);
      console.log(itemList);
    }
  };

  useEffect(() => {
    updateItems();
  }, []);

  const addItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'pantry'), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const {count} = docSnap.data();
        await setDoc(docRef, {count: count + 1});
      }
      else {
        await setDoc(docRef, {count: 1});
      }
      await updateItems();
    } catch (error) {
      console.error('Error adding Item', error);
    }
  }
  const removeItem = async (item) => {
    try {
      const docRef = doc(collection(firestore, 'pantry'), item);
      const docSnap = await getDoc(docRef);
      const {count} = docSnap.data();
      if (count > 1) {
        await setDoc(docRef, {count: count - 1});
      }
      else {
        await deleteDoc(docRef);
      }
      await updateItems();
    } catch (error) {
      console.error('Error removing Item', error);
    }
  };
  return <Box
      width="100vw"
      height="100%"
      display="flex"
      justifyContent="center"
      flexDirection={'column'}
      alignItems="center"
      gap={2}
      marginTop={2}
    >

    <Box width={'800px'} justifyContent={'space-between'} display={'flex'} flexDirection={'row'} padding={'10px'} direction={'row'} spacing={2}>
        <TextField id="outlined-basic" label="Search an Item" variant="outlined"/>
        <Button variant="contained">Search</Button>
        <Button variant="contained" onClick={handleOpen}>Add</Button>
    </Box>

  <Modal
    open={open}
    onClose={handleClose}
    aria-labelledby="modal-modal-title"
    aria-describedby="modal-modal-description"
  >
    <Box sx={style}>
      <Typography id="modal-modal-title" variant="h6" component="h2">
        Add Item
      </Typography>
      <Stack spacing={2}>
        <TextField id="outlined-basic" label="Insert an Item" variant="outlined"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        />
        <Button variant="contained" onClick={() => {
                                                    addItem(itemName);
                                                    handleClose()
                                                    setItemName('');
                                                    }
                                                  }
          >Add</Button>
      </Stack>
    </Box>
  </Modal>

  <Box border="1px solid #333">
  <Box width={'800px'} height={'100px'} border="1px solid #333" alignContent={'center'} alignItems={'center'} justifyContent={'center'} display={'flex'} flexDirection={'column'} spacing={2}>
    <Typography variant="h3" color="primary" textAlign={'center'}>
      Inventory Tracker
    </Typography>
  </Box>

  <Stack width="800px" height="500px" spacing={2} overflow={"scroll"} alignContent={'center'} alignItems={'center'}>
  {itemList.map(({name, count}) => (

      <Box
        key={name}
        display="flex"
        justifyContent="space-between"
        paddingX={2}
        alignContent="center"
        width="95%"
        minHeight="50px"
        bgcolor="#333"
      >
        <Typography variant="h5" color="white" textAlign={'center'}>
          {name.charAt(0).toUpperCase() + name.slice(1)} 
        </Typography>
        <Typography variant="h5" color="white" textAlign={'center'}>
          Quantity: {count}
        </Typography>
        <Button variant="contained" onClick={() => removeItem(name)}>Remove</Button>
      </Box>
      
   
  ))}
  </Stack>
  </Box>
  </Box>;
}
