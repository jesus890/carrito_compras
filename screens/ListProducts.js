import { useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { StyleSheet, View, Image, Dimensions, ScrollView, FlatList   } from 'react-native';
import { Button, Card, Text, Snackbar, Dialog, Portal,  IconButton  } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';


function ListProducts({ route, navigation }) {
  
  const { informationUpdated } = route.params;

  const [listProducts, setListProducts] = useState([]);

  //activa el modal de cerrar sesion
  const [openDialog, setOpenDialog] = useState(false);

  //activa el modal de eliminar producto
  const [dialogDelete, setDialogDelete] = useState(false);

  //confirmacion de eliminar producto
  const [optionDelete, setOptionDelete] = useState(false);

  //captura el elemento seleccionado
  const [itemSelected, setItemSelected] = useState();

  //state encargado de mostrar advertencias
  const [alert, setAlert] = useState({
    show: false,
    message: ""
  });

  //obtiene los productos del localstorage
  useEffect(()=> {
    getProducts();
  },[])

  //refresca los productos, si hubiese algun crud
  useEffect(() => {
    if (informationUpdated === true) 
    {
      getProducts();

      //reset params
      navigation.setParams({
        informationUpdated: false,
      });
    }
  }, [informationUpdated])

  
  //si se presiona la tecla atras del celular
  useEffect(() => {
    
    navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === "GO_BACK") {
        setOpenDialog(true);
        e.preventDefault();
      }
    })
  }, [])


  //elimina el producto seleccionado
  useEffect(() => {
    if (optionDelete)
    {
      deleteProduct(itemSelected);

      //cierra el modal
      setDialogDelete(false);
      setOptionDelete(false);
    }
  },[optionDelete])


  //obtiene el listado de productos
  const getProducts = async() => {
    let products = JSON.parse(await AsyncStorage.getItem('@products')) || [];
    if (products.length === 0) {
      products = generateProducts();
      await AsyncStorage.setItem('@products', JSON.stringify(products));
    }
    setListProducts(products);
  }

  //genera un listado de productos ficticios
  const generateProducts = () => {
    let data = [
      {
        "_id": 1696877358222,
        "category": "Electrónicos",
        "description": "Mouse gamer a buen precio",
        "image": "https://www.cyberpuerta.mx/img/product/XL/CP-PERFECTCHOICE-PC-045106-132611.jpg",
        "name": "Mouse gamer",
        "price": "$250.50"
      },
      {
        "_id": 1696877358333,
        "category": "Electrónicos",
        "description": "Laptop gamer a buen precio",
        "image": "https://www.cyberpuerta.mx/img/product/XL/CP-LENOVO-82RB00PBLM-7072c4.png",
        "name": "Laptop gamer",
        "price": "$25330.50"
      },
      {
        "_id": 1696877358444,
        "category": "Electrónicos",
        "description": "PC gamer a buen precio",
        "image": "https://www.cyberpuerta.mx/img/product/XL/CP-XTREMEPCGAMING-XTAEI716GB3060-1.jpg",
        "name": "PC gamer",
        "price": "$30330.50"
      }
    ];
    return data;
  }
  
  const deleteProduct = async(itemSelected) => {
    let products = JSON.parse(await AsyncStorage.getItem('@products')) || [];

    //elimina el elemento seleccionado
    let result = products.filter((item) => item._id !== itemSelected._id);

    //guarda esa informacion en el locastorage
    let newProducts = await AsyncStorage.setItem('@products', JSON.stringify(result))

    //refresca el listado
    getProducts();
  }

  //remueve las credenciales del usuario logueado y regresa al login
  const redirectToLogin = async () => {
    try 
    {
      await AsyncStorage.removeItem('@userAccount')
      navigation.navigate("Login")
    } 
    catch(e) 
    {
      setAlert({
        message: e.toString(),
        show: true
      })
    }
  }

  //redirecciona a la pantalla de edicion
  const navigateToEdit= (item) => {
    navigation.navigate("Product", {
      product : item
    });
  }

  //redirecciona a la pantalla de nuevo producto
  const navigateToNew = () => {
    navigation.navigate("Product", {
      product : null
    });
  }

  function ModalExit ({openDialog, setOpenDialog, redirectToLogin  }) {
    return (
      <Portal>
        <Dialog visible={openDialog} onDismiss={() => setOpenDialog(false)}>
          <Dialog.Title>¿Desea cerrar sesión?</Dialog.Title>
          <Dialog.Actions>
            <Button onPress={() =>  setOpenDialog(false) }>Cancelar</Button>
            <Button onPress={() =>  redirectToLogin()}>Aceptar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )
  }

  function ModalDelete({dialogDelete, setDialogDelete, setOptionDelete, itemSelected }) {
    return (
      <Portal>
        <Dialog visible={dialogDelete} onDismiss={() => setDialogDelete(false)}>
          <Dialog.Title>¿Desea eliminar el siguiente elemento?</Dialog.Title>

          <Dialog.Content style={{width: 100}}>
            <Text style={{ color: "#676B75", fontSize: 14, textAlign: 'center', fontWeight: "bold" }}>
              {itemSelected !== undefined && itemSelected.name}
            </Text>
            <Text style={{ color: "#d15253", fontSize: 14, textAlign: 'center', fontWeight: "bold" }}>
              { itemSelected !== undefined&&  itemSelected.price}
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button onPress={() =>  setDialogDelete(false) }>Cancelar</Button>
            <Button onPress={() =>  setOptionDelete(true)}>Aceptar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )
  }

  const ListFooterComponent = (
    <View style={styles.circle}>
      <IconButton
        icon="plus"
        iconColor="white"
        size={40}
        onPress={() => navigateToNew()}
        style={{marginTop: -3}}   
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Snackbar
        visible={alert.show}
        onDismiss={() => setAlert({ ...alert, show: false })}
        style={{ zIndex: 100, position: "relative" }}
        action={{
          label: "aceptar",
        }}
      >
        {alert.message}
      </Snackbar>
      
      
      <ModalExit {...{openDialog, setOpenDialog, redirectToLogin }}/>

      <ModalDelete {...{dialogDelete, setDialogDelete, setOptionDelete, itemSelected }}/>

      <View style={{ backgroundColor: "#222222", height: 65 }}>
        <Text style={{ color: "white", fontSize: 22, textAlign: "center", marginTop: 15}}>
          Productos
        </Text>
      </View>


      <FlatList
        numColumns={2}
        data={listProducts}
        renderItem={({ item, index }) => (
          <Card style={{ width: "40%", marginLeft: 10, marginRight: 10, marginTop: 10, backgroundColor: "#e0e3f0" }}>

            <Card.Content>
              <Image
                source={{ uri: item.image }}
                style={{ width: 100, height: 100, marginLeft: "auto", marginRight: "auto", borderRadius: 10 }}
                resizeMode="stretch"
              />

              <Text style={{ color: "#676B75", fontSize: 16, textAlign: 'center', fontWeight: "bold", marginTop: 15 }}>
                {item.name}
              </Text>

              <Text style={{ color: "#d15253", fontSize: 16, textAlign: 'center', fontWeight: "bold" }}>
                {item.price}
              </Text>

            </Card.Content>

            <Card.Actions>
              
              <Button 
                icon="pencil" 
                mode="default" 
                textColor='black'
                onPress={() => navigateToEdit(item)}>
              </Button>

              <Button 
                icon="delete" 
                mode="default" 
                textColor='#d15253'
                onPress={() => (setDialogDelete(true), setItemSelected(item))}>
              </Button>

            </Card.Actions>
          </Card>
        )}
        ListFooterComponent={ListFooterComponent}
        ListFooterComponentStyle={{ marginLeft: "auto", marginRight: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  button: {
    width: 'auto',
    
    marginTop: 25,
    borderRadius: 8
  },
  circle: {
    marginTop: 20,
    width: 50, // Ancho del círculo
    height: 50, // Alto del círculo
    borderRadius: 50, // La mitad del ancho o alto para crear un círculo
    backgroundColor: '#222222', // Color de fondo del círculo (puedes cambiarlo)
    alignItems: 'center'
  },
});

export default ListProducts;
