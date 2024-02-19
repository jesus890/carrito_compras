import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { StyleSheet, View, Image, Dimensions, ScrollView  } from 'react-native';
import { Button, Card, Text, Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Formik } from 'formik';
import * as yup from 'yup'


function SignUp({ navigation }) {

  //validaciones
  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .required('Por favor escriba su nombre'),
    email: yup
      .string()
      .email("Digite un correo electronico valido")
      .required('Por favor escriba su correo electronico'),
    password: yup
      .string()
      .min(5, ({ min }) => `El password debe tener ${min} caracteres como minimo`)
      .required('Por favor escriba su password'),
    passwordConfirmation: yup.string()
     .required('Por favor escriba su password')
     .min(5, ({ min }) => `El password debe tener ${min} caracteres como minimo`)
     .oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden')
  })

  // muestra/oculta la contraseña
  const [hidePassword, setHidePassword] = useState(true);
  const [hidePassword2, setHidePassword2] = useState(true);

  //deshabilita doble clic
  const [standBy, setStandBy] = useState(false);

  //state encargado de mostrar advertencias
  const [alert, setAlert] = useState({
    show: false,
    message: ""
  });

  let screenHeight = Dimensions.get("window").height;

  //inserta un nuevo usuario
  const saveData = async(value) => {

    //habilita un modo de espera
    setStandBy(true);

    try 
    {
      //obtiene el listado de usuarios
      let listUsers = JSON.parse(await AsyncStorage.getItem('@users'))

      let existUser = listUsers.filter(item => item.email === value.email);
      
      //verifica si el ya correo existe
      if (existUser.length > 0)
      {
        setAlert({
          message: "El correo electronico ya se encuentra registrado",
          show: true
        })

        setStandBy(false);
      }
      else
      {
        
        listUsers.push({
          name: value.name,
          email: value.email,
          password: value.password,
          role: "client"
        });

        //añade el usuario al localstorage
        await AsyncStorage.setItem('@users',  JSON.stringify(listUsers));

        //guarda el inicio de sesion en un storage
        await AsyncStorage.setItem('@userAccount',  JSON.stringify({
          name: value.name,
          email: value.email,
          password: value.password,
          role: "client"
        }))

        await AsyncStorage.removeItem('@shoppingCart')
        await AsyncStorage.removeItem('@favorites')

        //redirecciona a la pagina del cliente
        navigation.navigate('ClientPage')

        setStandBy(false);
      }
    }
    catch (e) 
    {
      setAlert({
        message: e.toString(),
        show: true
      })
    }
  }

  function ExtraInformation({ navigation }) {
    return (
      <View style={{ marginTop: 30 }}>
        <Text style={{ color: "#676B75", fontSize: 16, textAlign: 'center' }}>¿Ya tienes una cuenta?</Text>
        <Text
          onPress={() => navigation.navigate('Login')}
          style={{ color: "#353c59", fontSize: 16, textAlign: 'center', marginTop: 10, marginBottom: 15 }}>
          Login
        </Text>
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
              initialValues={{ name: '', email: '', password: '', passwordConfirmation: '' }}
              onSubmit={values => saveData(values)}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, isValid }) => (
                <>

                  <TextInput
                    label={<Text style={{ color: "#676B75" }}>Nombre</Text>}
                    value={values.name}
                    onChangeText={handleChange('name')}
                    textColor="#686B75"
                    style={{ marginTop: 20, backgroundColor: "#e0e3f0", fontSize: 16 }}
                    theme={{ colors: { primary: '#353c59' } }}
                  />

                  {errors.name &&
                    <Text style={{ fontSize: 14, color: "#d15253" }}>{errors.name}</Text>
                  }

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
                    label={<Text style={{ color: "#676B75" }}>Contraseña</Text>}
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

                  <TextInput
                    label={<Text style={{ color: "#676B75" }}>Confirmar contraseña</Text>}
                    value={values.passwordConfirmation}
                    onChangeText={handleChange('passwordConfirmation')}
                    secureTextEntry={hidePassword}
                    right={<TextInput.Icon icon={!hidePassword2 ? "eye" : "eye-off"} onPress={() => setHidePassword2(!hidePassword2)} />}
                    textColor="#686B75"
                    style={{ marginTop: 20, backgroundColor: "#e0e3f0", fontSize: 16 }}
                    theme={{ colors: { primary: '#353c59' } }}
                  />

                  {errors.passwordConfirmation &&
                    <Text style={{ fontSize: 14, color: "#d15253" }}>{errors.passwordConfirmation}</Text>
                  }

                  <Button mode="contained" buttonColor="#222222" onPress={handleSubmit} style={styles.button} disabled={standBy ? true : false}>
                    {standBy ? "Espera un momento" : "Registrarse"}
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
    backgroundColor: '#fff'
  },
  button: {
    width: 200,
    marginLeft: "auto",
    marginTop: 25,
    borderRadius: 8
  }
});

export default SignUp;
