import { useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { StyleSheet, View, Image, ScrollView  } from 'react-native';
import { Button, Text, Snackbar, TouchableRipple  } from 'react-native-paper';
import MaskInput, { createNumberMask } from 'react-native-mask-input';
import { Formik } from 'formik';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as yup from 'yup'
import * as ImagePicker from 'expo-image-picker';
import {Picker} from '@react-native-picker/picker';

function Product({ route, navigation }) {

  const { product } = route.params;


  //validaciones
  const validationSchema = yup.object().shape({
    
    name: yup
      .string()
      .required('Por favor escriba un nombre del producto'),
    price: yup
      .string()
      .required('Por favor escriba un precio del producto'),
    category: yup
      .string()
      .required('Por favor seleccione una categoria del producto'),
    description: yup
      .string()
      .required('Por favor escriba una descripcion del producto'),
  })

  const [initialValues, setInitialValues] = useState({
    name: product !== null ? product.name : "",
    price: product !== null ? product.price : "", 
    category: product !== null ? product.category : "Electrónicos", 
    description: product !== null ? product.description : ""
  })

  //state encargado de mostrar advertencias
  const [alert, setAlert] = useState({
    show: false,
    message: ""
  });

  //imagen
  const [image, setImage] = useState(product !== null ? product.image : null);

  //selecciona una imagen de la galeria del telefono
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      aspect: [4, 3],
      base64: true,
      quality: 0.3,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  };

  //price mask
  const priceMask = createNumberMask({
    prefix: ['$'],
    delimiter: ',',
    separator: '.',
    precision: 2,
  })

  //deshabilita doble clic
  const [standBy, setStandBy] = useState(false);

  const saveData = async(values) => {
    
    setStandBy(true);

    try
    {
      //si existe una imagen
      if (image !== null)
      {
        //obtiene el listado de productos
        let products = JSON.parse(await AsyncStorage.getItem('@products')) || [];

        if (product === null) //es una inserccion
        {
          addNewProduct(products, values)
        }
        else //actualizacion
        {
          updateProduct(products, values);
        }
      }
      else
      {
        setAlert({
          message: "Suba una imagen primero",
          show: true
        })
      }
    }
    catch(e)
    {
      setAlert({
        message: e.toString(),
        show: true
      })

      setStandBy(false);
    }
  }

  //añade un nuevo producto al localstorage
  const addNewProduct = async (products, values) => {
    
    products.push({
      _id: new Date().getTime(),
      name: values.name,
      price: values.price,
      image: image,
      category: values.category,
      description: values.description
    })

    //guarda ese elemento en el local storage
    await AsyncStorage.setItem('@products', JSON.stringify(products))

    //si se inserta la informacion redirecciona al listado de productos
    if (products) {
      redirectToList();
    }
  }


  //actualiza el producto del localstorage
  const updateProduct = async (products, values) => {

    //recupera el indice del arreglo
    const index = products.findIndex(item => item._id === product._id);

    //copiamos el arreglo anterior
    const productsTemp = [...products];

    //actualizamos el indice del arreglo
    productsTemp[index] = {
      _id: product._id,
      name: values.name,
      price: values.price,
      image: image,
      category: values.category,
      description: values.description
    }

    //actualiza ese elemento en el local storage
    await AsyncStorage.setItem('@products', JSON.stringify(productsTemp))

    //si se inserta la informacion redirecciona al listado de productos
    if (productsTemp) {
      redirectToList();
    }
  }

  //redirecciona al listado de productos
  const redirectToList = () => {

    setStandBy(false);
    navigation.navigate("ListProducts", {
      informationUpdated: true,
    });
  }

  function NoImage({pickImage}) {
    return (
      <>
        <TouchableRipple onPress={()=> pickImage()} rippleColor="rgba(0, 0, 0, .32)">
          <Image
            source={require("../img/upload.png")}
            style={{ marginLeft: "auto", marginRight: "auto", marginTop: 10 }}
            resizeMode="stretch"
          />
        </TouchableRipple>
        <Text style={{ color: "#676B75", fontSize: 16, textAlign: 'center', marginBottom: 15 }}>Carga tu imagen</Text>
      </>
    )
  }

  function ProductImage({ pickImage }) {
    return (
      <View style={{ backgroundColor: "#e0e3f0", height: "auto", borderStyle: "dashed", borderRadius: 10, borderWidth: 1 }} >
        {image === null ? (
          <NoImage {...{ pickImage }} />
        ) : (
          <TouchableRipple onPress={()=>pickImage()} rippleColor="rgba(0, 0, 0, .32)">
            <Image
              source={{ uri: image }}
              style={{ width: 180, height: 180, marginLeft: "auto", marginRight: "auto", marginBottom: 20, marginTop: 20 }}
            />
          </TouchableRipple>
        )}
      </View>
    )
  }
  

  return (
    <ScrollView style={styles.container}>
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

      <View style={{ backgroundColor: "#353C59", height: 65 }}>
        <Text style={{ color: "white", fontSize: 22, textAlign: "center", marginTop: 15}}>
          {product !== null ? "Actualizar producto" : "Agregar producto"}
        </Text>
      </View>


      <View style={{padding: 20}}>   
        <Formik
          validationSchema={validationSchema}
          initialValues={initialValues}
          onSubmit={values => saveData(values)}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, isValid }) => (
            <>
            
              <ProductImage {...{ pickImage }} />

              <TextInput
                label={<Text style={{ color: "#676B75" }}>Nombre</Text>}
                value={values.name}
                onChangeText={handleChange('name')}
                textColor="#686B75"
                style={{ marginTop: 20, backgroundColor: "#e0e3f0", fontSize: 16 }}
                theme={{ colors: { primary: '#353c59' } }}
              />

              {errors.name &&
                <Text style={{ fontSize: 14, color:"#d15253" }}>{errors.name}</Text>
              }     

              <MaskInput
                value={values.price}
                mask={priceMask}
                onChangeText={handleChange('price')}
                keyboardType='numeric'
                textColor="#686B75"
                style={{ marginTop: 20, backgroundColor: "#e0e3f0", fontSize: 16, height: 50, padding: 10, borderTopRightRadius: 8, borderTopLeftRadius: 8 }}
                theme={{ colors: { primary: '#353c59' } }}
              />

              {errors.price &&
                <Text style={{ fontSize: 14, color:"#d15253" }}>{errors.price}</Text>
              } 

              <Picker
                selectedValue={values.category}
                style={{ height: 50, width: "auto",  backgroundColor: "#e0e3f0", fontSize: 16, marginTop: 20  }}
                onValueChange={handleChange('category')}
                textColor="#686B75"
              >
                <Picker.Item label="Electrónicos" value="Electrónicos" />
                <Picker.Item label="Ropa" value="Ropa" />
                <Picker.Item label="Limpieza" value="Limpieza" />
              </Picker>

              { errors.category &&
                <Text style={{ fontSize: 14, color:"#d15253" }}>{errors.category}</Text>
              }



              <TextInput
                label={<Text style={{ color: "#676B75" }}>Descripción</Text>}
                value={values.description}
                onChangeText={handleChange('description')}
                textColor="#686B75"
                style={{ marginTop: 20, backgroundColor: "#e0e3f0", fontSize: 16 }}
                theme={{ colors: { primary: '#353c59' } }}
                multiline={true}
              />

              {errors.description &&
                <Text style={{ fontSize: 14, color:"#d15253" }}>{errors.description}</Text>
              } 
              
              <Button mode="contained" buttonColor="#222222" onPress={handleSubmit} style={styles.button} disabled={standBy ?  true : false}>
                {standBy ? "Espera un momento" : "Guardar producto"}
              </Button>
            </> 
          )}
         </Formik>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  button: {
    width: 'auto',
    marginTop: 100,
    borderRadius: 8
  }
});

export default Product;
