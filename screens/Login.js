import { useEffect, useState } from 'react';
import { TextInput } from 'react-native-paper';
import { StyleSheet, View, Image, Dimensions, ScrollView } from 'react-native';
import { Button, Card, Text, Snackbar } from 'react-native-paper';
import { Formik } from 'formik';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as yup from 'yup'


function Login({ navigation }) {

  //validaciones
  const validationSchema = yup.object().shape({
    email: yup
      .string()
      .email("Digite un correo electronico valido")
      .required('Por favor escriba su correo electronico'),
    password: yup
      .string()
      .required('Por favor escriba su password'),
  })

  //mostrar/ocultar password
  const [hidePassword, setHidePassword] = useState(true);

  //state encargado de mostrar advertencias
  const [alert, setAlert] = useState({
    show: false,
    message: ""
  });

  let screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    isUserLogin();
  })


  //inicia sesion
  const access = async (value) => {
    try 
    {
      //obtiene el listado de usuarios
      let listUsers = JSON.parse(await AsyncStorage.getItem('@users'))

      //comprueba si el inicio de sesion es correcto
      let userAccount = listUsers.filter((item) => item.email === value.email && item.password === value.password);

      if (userAccount.length > 0) //credenciales correctas
      {
        //guarda el inicio de sesion en un storage
        await AsyncStorage.setItem('@userAccount',  JSON.stringify(userAccount[0]))

        //en base al rol, redireccionamos a la pantalla adecuada
        if(userAccount[0].role === "admin")
        {
          navigation.navigate('ListProducts')
        }
        else
        {
          await AsyncStorage.removeItem('@shoppingCart')
          await AsyncStorage.removeItem('@favorites')

          //redirecciona a la pagina del cliente
          navigation.navigate('ClientPage')
        }
      }
      else 
      {
        setAlert({
          message: "El correo electronico o la contraseña es incorrecta ",
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

  //verifica si existe un inicio de sesion abierto
  const isUserLogin = async () => {
    let user = JSON.parse(await AsyncStorage.getItem('@userAccount'))
    
    if (user !== null)
    {
      if (user.role === "admin") 
      {
        //redirecciona a la pagina del admin
        navigation.navigate('ListProducts')
      }
      else 
      {
        //redirecciona a la pagina del cliente
        navigation.navigate('ClientPage')
      }
    }
  }

  function ExtraInformation({ navigation }) {
    return (
      <View style={{marginTop: '80%'}}>
        <Text style={{ color: "#676B75", fontSize: 16, textAlign: 'center' }}>¿Aún no tienes cuenta?</Text>
        <Text
          onPress={() => navigation.navigate('SignUp')}
          style={{ color: "#353c59", fontSize: 16, textAlign: 'center', marginTop: 10 }}>
          Regístrate
        </Text>
        <Text style={{ color: "#676B75", fontSize: 14, textAlign: 'center', marginTop: 20 }}>Jesús Gómez Urbano  | imperiojesus89@gmail.com</Text>
      </View>
    )
  }


  return (
    <ScrollView style={styles.container}>

      <Snackbar
        visible={alert.show}
        onDismiss={() => setAlert({...alert, show: false})}
        style={{zIndex: 100, position: "relative"}}
        action={{
          label: 'aceptar'
        }}>
        {alert.message}
      </Snackbar>

        <View style={{ flex:1, backgroundColor: "#222222", height: 100 }}>
          <Image
            source={require('../img/react.png')}
            style={{ width: 100, height: 50, marginLeft: "auto", marginRight: "auto", marginTop: 25 }}
            resizeMode="stretch"
          />
        </View>  

        <Card mode="elevated" style={{ marginTop: -10, height: screenHeight - 150 }} >
          <Card.Content >
            <Formik
              validationSchema={validationSchema}
              initialValues={{ email: '', password: '' }}
              onSubmit={values => access(values)}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, isValid }) => (
                <>

                  <TextInput
                    label={<Text style={{ color: "#676B75" }}>Email</Text>}
                    value={values.email}
                    onChangeText={handleChange('email')}
                    textColor="#686B75"
                    style={{ marginTop: 20, backgroundColor: "#e0e3f0", fontSize: 16 }}
                    theme={{ colors: { primary: '#353c59' } }}
                  />

                  {errors.email &&
                    <Text style={{ fontSize: 14, color: "#d15253" }}>{errors.email}</Text>
                  }

                  <TextInput
                    label={<Text style={{ color: "#676B75" }}>Password</Text>}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    secureTextEntry={hidePassword}
                    right={<TextInput.Icon icon={!hidePassword ? "eye" : "eye-off"} onPress={() => setHidePassword(!hidePassword)} />}
                    textColor="#686B75"
                    style={{ marginTop: 20, backgroundColor: "#e0e3f0", fontSize: 16 }}
                    theme={{ colors: { primary: '#353c59' } }}
                  />

                  {errors.password &&
                    <Text style={{ fontSize: 14, color: "#d15253" }}>{errors.password}</Text>
                  }

                  <Button mode="contained" buttonColor="#222222" onPress={handleSubmit} style={styles.button}>
                    Ingresar
                  </Button>
                </>
              )}
            </Formik>
          </Card.Content>

          <ExtraInformation {...{ navigation }} />

        </Card>

    </ScrollView>
    

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  button: {
    width: 200,
    marginLeft: "auto",
    marginTop: 25,
    borderRadius: 8
  }
});

export default Login;
