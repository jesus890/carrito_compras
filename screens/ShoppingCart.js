import { useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { StyleSheet, View, Image, FlatList  } from 'react-native';
import { Button, Text, Snackbar, Card, Appbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NumericInput from 'react-native-numeric-input'

function ShoppingCart({ route, navigation }) {

  const [shoppingCart, setShoppingCart] = useState([]);

  const [informationUpdated, setInformationUpdated] = useState(false);

  const [total, setTotal] = useState("");

  //state encargado de mostrar advertencias
  const [alert, setAlert] = useState({
    show: false,
    message: ""
  });


  const buyProducts = async (e) => {
    try {
      e.preventDefault();

      let result = await AsyncStorage.removeItem('@shoppingCart');
      
      //redirecciona a la pagina del cliente
      navigation.navigate('ClientPage' , {
        cartEmpty: true,
      })
    }
    catch (e) {
      setAlert({
        message: e.toString(),
        show: true
      })
    }
  }

  //obtiene el carrito de compras del usuario
  useEffect(() => {
    getShoppingCart();
  },[])


  //si el carrito de compras fue actualizado
  useEffect(() => {
    if(informationUpdated)
    {
      getShoppingCart();
      setInformationUpdated(false);
    }
  },[informationUpdated])


  //obtiene el carrito de compras y el total por pagar
  const getShoppingCart = async() => {
    let shoppingCart = JSON.parse(await AsyncStorage.getItem('@shoppingCart')) || [];

    let total = 0;
    
    shoppingCart.map((item, index) => {
      total += (parseInt(item.quantity) * parseFloat( (item.price.replace("$", "").replace(",", ""))  ))
    })

    setTotal(total.toFixed(2));
    setShoppingCart(shoppingCart);
  }

  //actualiza la cantidad del carrito de compras
  const handleChange = (value, item) => {
    updateProduct (value, item);
  }

  const updateProduct = async (value, product) => {
    //recupera el indice del arreglo
    const index = shoppingCart.findIndex(item => item._id === product._id);

    //copiamos el arreglo anterior
    const shoppingCartTemp = [...shoppingCart];

    //actualizamos la canditad del producto
    shoppingCartTemp[index] = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      quantity: parseInt(value)
    }

    //actualiza ese elemento en el local storage
    let result = await AsyncStorage.setItem('@shoppingCart', JSON.stringify(shoppingCartTemp))

    setInformationUpdated(true);
  }

  
  return (
    <View style={styles.container}>

      <Appbar.Header>
        <Appbar.BackAction onPress={() => {navigation.navigate("ClientPage")}} />
        <Appbar.Content title="Mi Carrito" style={{marginLeft: "20%"}}/>
      </Appbar.Header>

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

      <FlatList
        numColumns={1}
        data={shoppingCart}
        renderItem={({ item, index }) => (
          <Card style={{ backgroundColor: "#e0e3f0", width: "95%", marginLeft: "auto", marginRight: "auto", marginTop: 20 }}>

            <Card.Content>

              <View style={styles.row}> 

                <View style={{width: "30%"}}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: "100%", height: 80,  borderRadius: 10 }}
                    resizeMode="stretch"
                  />
                </View>
              
                <View style={{marginLeft: 20, width: "auto"}}>
                  <Text style={{ color: "#686b75", fontSize: 16, fontWeight: "bold", marginTop: 15 }}>
                    {item.name}
                  </Text>
                  <Text style={{ color: "#353c59", fontSize: 16, fontWeight: "bold" }}>
                    {item.price}
                  </Text>
                </View>

                <View style={{ marginLeft: "65%", marginTop: -30 }}>
                  <NumericInput
                    initValue={item.quantity}
                    onChange={value => handleChange(value, item)}
                    iconSize={10}
                    separatorWidth={0}
                    totalWidth={100}
                    minValue={1}
                    rounded
                    inputStyle={{ fontSize: 16 }}
                    style={{ marginLeft: 25 }}
                  />
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
        ListFooterComponent={() => (
          <>
            <Text style={{ color: "#353c59", fontSize: 24, fontWeight: "bold", marginTop: 15, textAlign: "right", paddingRight: 15 }}>
              {"Total: $" + total}
            </Text>
            <Button 
              mode="contained" 
              buttonColor="#222222"
              disabled={shoppingCart.length === 0 ? true : false}
              onPress={(e) => buyProducts(e)} style={styles.button}>
              Comprar ahora
            </Button>
          </>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: 80, 
    height: 80,
    borderRadius: 10
  },
  text: {
    color: "#000000", 
    fontSize: 16, 
    textAlign: 'left', 
    fontWeight: "bold", 
    marginTop: 15,
    marginLeft: 15
  },
  button: {
    width: "90%",
    marginLeft: "5%",
    borderRadius: 8,
    marginTop: 20
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    row: true
  },
});

export default ShoppingCart;
