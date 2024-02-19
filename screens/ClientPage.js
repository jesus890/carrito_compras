import { useEffect, useState } from 'react';
import { StyleSheet, View, Image, Dimensions, ScrollView, FlatList   } from 'react-native';
import { Button, Card, Text, Snackbar, Avatar,  TouchableRipple, Appbar, Dialog, Portal, BottomNavigation } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';


function ClientPage({ route, navigation }) {
  
  const { informationUpdated, cartEmpty } = route.params;

  //state encargado de mostrar advertencias
  const [alert, setAlert] = useState({
    show: false,
    message: ""
  });

  //listado de productos
  const [listProducts, setListProducts] = useState([]);
  const [listProductsTemp, setListProductsTemp] = useState([]);

  //listado de favoritos
  const [favorites, setFavorites] = useState([])

  //usuario logueado
  const [userAccount, setUserAccount] = useState();

  //filtros
  const [filter, setFilter] = useState("");

  //elementos del carrito de compras
  const [itemCart, setItemCart] = useState(0);

  //abre un cuadro de dialogo de cerrar sesion
  const [openDialog, setOpenDialog] = useState(false);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'Home', title: 'Home', focusedIcon: 'home' },
    { key: 'Favoritos', title: 'Favoritos', focusedIcon: 'heart', unfocusedIcon: 'heart-outline'},
  ]);

  //obtiene informacion del localstorage
  useEffect(()=> {
    getProducts();
    getUserInfo();
  },[])

  //filtra por categories
  useEffect(() => {
    if (filter !== "")
      filterProducts(filter)
    else
      getProducts();
  },[filter])


  //si se presiona la tecla atras del dispositivo
  useEffect(() => {
    navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === "GO_BACK") 
      {
        setOpenDialog(true);
        e.preventDefault();
      }
    })
  }, [])

  //obtiene los elementos del carrito y listado de favorites
  useEffect(() => {
    getShoppingCart();
    getFavorites();
  },[])

  //obtiene los elementos del carrito o favoritos, despues de una actualizacion
  useEffect(() => {
    if (informationUpdated === true) 
    {
      getShoppingCart();
      getFavorites();

      //reset params
      navigation.setParams({
        informationUpdated: false,
        cartEmpty: false
      });
    }
  }, [informationUpdated])

  //se compro lo del carrito de compras
  useEffect(() => {
    if(cartEmpty)
    {

      setItemCart(0);
      setAlert({
        message: "Gracias por tu compra",
        show: true
      })

      //reset params
      navigation.setParams({
        informationUpdated: false,
        cartEmpty: false
      });
    }
  },[cartEmpty])


  //obtiene cuantos productos hay en el carrito de compras
  const getShoppingCart = async() => {
    let shoppingCart = JSON.parse(await AsyncStorage.getItem('@shoppingCart')) || [];
    setItemCart(shoppingCart.length);
  }

  const getFavorites = async() => {
    let favorites = JSON.parse(await AsyncStorage.getItem('@favorites')) || [];
    setFavorites(favorites);
  }

  //remueve las credenciales del usuario y el carrito de compras logueado y regresa al login
  const redirectToLogin = async () => {
    try 
    {
      await AsyncStorage.removeItem('@userAccount')
      await AsyncStorage.removeItem('@shoppingCart')
      await AsyncStorage.removeItem('@favorites')
      navigation.navigate("Login")
    }
    catch (e) {
      setAlert({
        message: e.toString(),
        show: true
      })
    }
  }

  //obtiene el listado de productos
  const getProducts = async() => {
    let products = JSON.parse(await AsyncStorage.getItem('@products')) || []
    setListProducts(products);
    setListProductsTemp(products)
  }

  //filtra de acuerdo a categorias
  const filterProducts = async(value) => {
    let filterResult = listProductsTemp.filter((item) => item.category === value)
    setListProducts(filterResult);
  }

  //obtiene el inicio de sesion
  const getUserInfo = async()=> {
    let user = JSON.parse(await AsyncStorage.getItem('@userAccount'))
    setUserAccount(user);
  }

  //redirecciona a la pantalla de comprar producto
  const navigateToProduct= (item) => {
    navigation.navigate("ProductInfo", {
      product : item
    });
  }

  //filtros con botones
  const Filters = () => {
    return (
      <View style={{ height: 90 }}>
        <ScrollView horizontal={true}  >
          <Button
            mode="contained"
            buttonColor={filter === "Electrónicos" ? "#222222" : "#e0e3f0"}
            onPress={() => setFilter("Electrónicos")}
            style={styles.button}
          >
            Electrónicos
          </Button>

          <Button
            mode="contained"
            buttonColor={filter === "Ropa" ? "#222222" : "#e0e3f0"}
            onPress={() => setFilter("Ropa")}
            style={styles.button}>
            Ropa
          </Button>

          <Button
            mode="contained"
            buttonColor={filter === "Limpieza" ? "#222222" : "#e0e3f0"}
            onPress={() => setFilter("Limpieza")}
            style={styles.button}>
            Limpieza
          </Button>

          <Button
            mode="contained"
            buttonColor={filter === "" ? "#222222" : "#e0e3f0"}
            onPress={() => setFilter("")}
            style={styles.button}>
            Todos
          </Button>

        </ScrollView>
      </View>
    )
  }

  //dialogo cerrar sesion
  function DialogExit({ openDialog, setOpenDialog, redirectToLogin }) {
    return (
      <Portal>
        <Dialog visible={openDialog} onDismiss={() => setOpenDialog(false)}>
          <Dialog.Title>¿Desea cerrar sesión?</Dialog.Title>
          <Dialog.Actions>
            <Button onPress={() => setOpenDialog(false)}>Cancelar</Button>
            <Button onPress={() => redirectToLogin()}>Aceptar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    )
  }


  //componente principal del cliente, muestra el listado de todos los productos, con sus filtros
  const MainPage = () => {
    return (
      <>
      <Text style={{ color: "#353c59", fontSize: 22, textAlign: 'left', fontWeight: "bold", marginTop: 20, marginLeft: 20 }}>
        {userAccount  && ("Hola " + userAccount.name)}
      </Text>

      <Text style={{ color: "#686b75", fontSize: 16, textAlign: 'left', fontWeight: "bold", marginTop: 10, marginLeft: 20 }}>
        ¿Vamos a comprar algo?
      </Text>

      {Filters ()}

      <FlatList
        numColumns={2}
        data={listProducts}
        renderItem={({ item, index }) => (
          <Card style={{ width: "40%", marginLeft: 10, marginRight: 10, marginTop: 20, backgroundColor: "#e0e3f0" }}>
            <TouchableRipple onPress={() => navigateToProduct(item)} rippleColor="rgba(0, 0, 0, .32)" style={{ padding: 5 }}>
              <Card.Content>

                <Image
                  source={{ uri: item.image }}
                  style={{ width: 100, height: 100, marginLeft: "auto", marginRight: "auto", borderRadius: 10 }}
                  resizeMode="stretch"
                />

                <View style={{ backgroundColor: "white", borderRadius: 10, width: "auto", height: "auto", marginTop: 15 }}>
                  <Text style={{ color: "#686b75", fontSize: 16, textAlign: 'center', fontWeight: "bold", marginTop: 15 }}>
                    {item.name}
                  </Text>

                  <Text style={{ color: "#000000", fontSize: 16, textAlign: 'center', fontWeight: "bold" }}>
                    {item.price}
                  </Text>
                </View>


              </Card.Content>
            </TouchableRipple>
          </Card>
        )}
      />
      </>
    )
  }


  const Favorites = () => {
    return (
      <>
      <Text style={{ color: "#353c59", fontSize: 22, textAlign: 'left', fontWeight: "bold", marginTop: 20, marginLeft: 20 }}>
        {userAccount  && ("Hola " + userAccount.name)}
      </Text>

      <Text style={{ color: "#686b75", fontSize: 16, textAlign: 'left', fontWeight: "bold", marginTop: 10, marginLeft: 20 }}>
        ¿Vamos a comprar algo?
      </Text>

      <FlatList
        numColumns={2}
        data={favorites}
        renderItem={({ item, index }) => (
          <Card style={{ width: "40%", marginLeft: 10, marginRight: 10, marginTop: 20, backgroundColor: "#e0e3f0" }}>
            <TouchableRipple onPress={() => navigateToProduct(item)} rippleColor="rgba(0, 0, 0, .32)" style={{ padding: 5 }}>
              <Card.Content>

                <Image
                  source={{ uri: item.image }}
                  style={{ width: 100, height: 100, marginLeft: "auto", marginRight: "auto", borderRadius: 10 }}
                  resizeMode="stretch"
                />

                <View style={{ backgroundColor: "white", borderRadius: 10, width: "auto", height: "auto", marginTop: 15 }}>
                  <Text style={{ color: "#686b75", fontSize: 16, textAlign: 'center', fontWeight: "bold", marginTop: 15 }}>
                    {item.name}
                  </Text>

                  <Text style={{ color: "#000000", fontSize: 16, textAlign: 'center', fontWeight: "bold" }}>
                    {item.price}
                  </Text>
                </View>

              </Card.Content>
            </TouchableRipple>
          </Card>
        )}
      />
      </>
    )
  }

  const renderScene = BottomNavigation.SceneMap({
    Home: MainPage,
    Favoritos: Favorites,
  });


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

      <DialogExit {...{openDialog, setOpenDialog, redirectToLogin}}/>

      <Appbar.Header style={{backgroundColor: "#fff"}}>
       <Appbar.Content title="" />
        <Appbar.Action icon="cart" onPress={() => navigation.navigate("ShoppingCart")} style={{marginTop: 20}}/>
        <Avatar.Text size={18} label={itemCart} backgroundColor="#222222" style={{marginLeft:-10}}/>
      </Appbar.Header>

      {/* <MainPage {...{userAccount, setFilter, listProducts, navigateToProduct}}/> */}

      <BottomNavigation
        navigationState={{ index, routes }}
        onIndexChange={setIndex}
        renderScene={renderScene}
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
    width: 150,
    height: 50,
    marginTop: 25,
    borderRadius: 8,
    marginLeft: 15
  },
});

export default ClientPage;
