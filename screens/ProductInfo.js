import { useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { StyleSheet, View, Image, ScrollView  } from 'react-native';
import { Button, Text, Snackbar, Avatar, Appbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ProductInfo({ route, navigation }) {

  const { product } = route.params;

  //state encargado de mostrar advertencias
  const [alert, setAlert] = useState({
    show: false,
    message: ""
  });


  const addShoppingCart = async (e) => {
    try {
      e.preventDefault();

      let shoppingCart = JSON.parse(await AsyncStorage.getItem('@shoppingCart')) || [];

      //comprueba si ya se encuentra agregado el producto al carrito de compras
      let isInShoppingCart = shoppingCart.filter((item) => item._id === product._id)

      //el producto no existe
      if (isInShoppingCart.length === 0) {
        addNewProduct(shoppingCart)
      }
      else //el producto ya existe
      {
        updateProduct(shoppingCart);
      }
    }
    catch (e) {
      setAlert({
        message: e.toString(),
        show: true
      })
    }
  }

  //agrega el producto al carrito de compras
  const addNewProduct = async(shoppingCart) => {
    shoppingCart.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      quantity : 1
    })

    //guarda ese elemento en el local storage
    await AsyncStorage.setItem('@shoppingCart', JSON.stringify(shoppingCart))

    setAlert({
      message: "Se añadio tu producto al carrito de compras",
      show: true
    })

    //espera un segundo y redirecciona a la pagina del cliente
    setTimeout(function(){
      navigation.navigate('ClientPage' , {
        informationUpdated: true,
      })
    }, 1000)
  }

  //actualiza en uno la cantidad del producto del carrito de compras
  const updateProduct = async (shoppingCart) => {
    //recupera el indice del arreglo
    const index = shoppingCart.findIndex(item => item._id === product._id);

    //copiamos el arreglo anterior
    const shoppingCartTemp = [...shoppingCart];

    //actualizamos el indice del arreglo
    shoppingCartTemp[index] = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      quantity: parseInt(shoppingCart[index].quantity) + 1
    }

    //actualiza ese elemento en el local storage
    await AsyncStorage.setItem('@shoppingCart', JSON.stringify(shoppingCartTemp))

    setAlert({
      message: "Se añadio tu producto al carrito de compras",
      show: true
    })

    //espera un segundo y redirecciona a la pagina del cliente
    setTimeout(function(){
      navigation.navigate('ClientPage' , {
        informationUpdated: true,
      })
    }, 1000)
  }


  //añade a favoritos el producto
  const addFavorites = async (e) => {

    try 
    {
      e.preventDefault();

      let favorites = JSON.parse(await AsyncStorage.getItem('@favorites')) || [];

      //comprueba si ya se encuentra agregado el producto al carrito de compras
      let inInFavorites = favorites.filter((item) => item._id === product._id)

      //el producto no existe
      if (inInFavorites.length === 0) {
        addProductoToFavorites(favorites)
      }
      else //el producto ya existe
      {
        setAlert({
          message: "Este producto ya esta en favoritos",
          show: true
        })
      }
    }
    catch (e) {
      setAlert({
        message: e.toString(),
        show: true
      })
    }
  }

  //añade el producto a favoritos
  const addProductoToFavorites = async(favorites) => {
    favorites.push({
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description,
      quantity : 1
    })

    //guarda ese elemento en el local storage
    await AsyncStorage.setItem('@favorites', JSON.stringify(favorites))

    setAlert({
      message: "Añadido a favoritos",
      show: true
    })

    //espera un segundo y redirecciona a la pagina del cliente
    setTimeout(function(){
      navigation.navigate('ClientPage' , {
        informationUpdated: true,
      })
    }, 1000)

  }


  function ProductDescription({ product }) {
    return (
      <>
        <Text style={styles.text}>
          {product.name}
        </Text>
        <Text style={styles.text}>
          {product.price}
        </Text>
        <Text style={{ ...styles.text, textAlign: "justify" }}>
          {product.description}
        </Text>
      </>
    )
  }

  return (
    <View style={styles.container}>

      <Appbar.Header style={{backgroundColor: '#fff'}}>
        <Appbar.BackAction onPress={() => navigation.navigate("ClientPage")} />
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
      
      <ScrollView>
        <View style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10, backgroundColor: "#e0e3f0" }} >
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="stretch"
          />
        </View>
        <ProductDescription {...{product}}/>
      </ScrollView>

     
      <Button   
        icon="heart"
        labelStyle={{fontSize: 50}}
        mode="default" 
        textColor='#353c59'
        style={{bottom: "10%", marginLeft: "80%", fontSize: 50}}
        onPress={(e) => addFavorites(e)}>
      </Button>


      <Button mode="contained" buttonColor="#353c59" onPress={(e) => addShoppingCart(e)} style={styles.button}>
        Agregar carrito
      </Button>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: 180, 
    height: 180, 
    marginLeft: "auto", 
    marginRight: "auto", 
    marginTop: 10, 
    marginBottom: 20,
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
    position: "absolute",
    bottom: 20
  }
});

export default ProductInfo;
