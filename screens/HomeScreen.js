import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Theme } from "@react-navigation/native";
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
} from "react-native-heroicons/outline";
import { debounce } from "lodash";
import { MapPinIcon } from "react-native-heroicons/solid";
import { fetWeatherForecast, fetchLocations } from "../api/weather";
import { weatherImages } from "../constants";
import * as Progress from "react-native-progress";
import { getData, storeData } from "../untils/asyncStorage";

export default function HomeScreen() {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [loading, setLoading] = useState(true);

  const handleLocation = (loc) => {
    setLocations([]);
    toggleSearch(false);
    setLoading(true);
    fetWeatherForecast({
      cityName: loc.name,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
      storeData("city", loc.name);
    });
  };

  const handleSearch = (value) => {
    // fetch locations
    if (value.length > 2) {
      fetchLocations({ cityName: value }).then((data) => {
        setLocations(data);
      });
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    let myCity = await getData("city");
    let cityName = "Singapor";
    if (myCity) cityName = myCity;
    fetWeatherForecast({
      cityName,
      days: "7",
    }).then((data) => {
      setWeather(data);
      setLoading(false);
    });
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location } = weather;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        style={styles.img}
        source={require("../assets/images/bg.png")}
        blurRadius={70}
      />
      {loading ? (
        <View style={styles.view1}>
          <Progress.CircleSnail thickness={10} size={140} />
        </View>
      ) : (
        <SafeAreaView style={styles.safeView}>
          {/**search section */}
          <View style={styles.view2}>
            <View style={styles.view3}>
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="serach city"
                  placeholderTextColor={"lightgray"}
                  style={styles.textIp}
                />
              ) : null}

              <TouchableOpacity
                onPress={() => toggleSearch(!showSearch)}
                style={styles.touch}
              >
                <MagnifyingGlassIcon size="25" color="white" />
              </TouchableOpacity>
            </View>
            {locations.length > 0 && showSearch ? (
              <View style={styles.view4}>
                {locations.map((loc, index) => {
                  let showBorder = index + 1 != locations.length;
                  let borderClass = showBorder ? "red" : "";
                  return (
                    <TouchableOpacity
                      onPress={() => handleLocation(loc)}
                      key={index}
                      style={styles.touch2}
                    >
                      <MapPinIcon size="20" color="gray" />
                      <Text style={styles.textt}>
                        {loc?.name},{loc?.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
          {/**forecast section */}
          <View style={styles.textCenter}>
            {/**location */}
            <Text style={styles.textMain}>
              {location?.name},
              <Text style={styles.text2}>{" " + location?.country}</Text>
            </Text>
            {/**weather image */}
            <View style={styles.view5}>
              <Image
                source={weatherImages[current?.condition?.text]}
                style={styles.clodyimg}
              />
            </View>
            {/**degree celcius */}
            <View style={styles.view6}>
              <Text style={styles.text3}>{current?.temp_c}℃</Text>
              <Text style={styles.text4}>{current?.condition?.text}</Text>
            </View>
            {/**other stats */}
            <View style={styles.view7}>
              <View style={styles.view8}>
                <Image
                  source={require("../assets/icons/wind.png")}
                  style={styles.img1}
                />
                <Text style={styles.text5}>{current?.wind_kph}km</Text>
              </View>
              <View style={styles.view9}>
                <Image
                  source={require("../assets/icons/drop.png")}
                  style={styles.img2}
                />
                <Text style={styles.text6}>{current?.humidity}%</Text>
              </View>
              <View style={styles.view9}>
                <Image
                  source={require("../assets/icons/sun.png")}
                  style={styles.img3}
                />
                <Text style={styles.text10}>
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>
          {/**forecast for next day */}
          <View style={styles.view10}>
            <View style={styles.view11}>
              <CalendarDaysIcon size="22" color="white" />
              <Text style={styles.text11}>Daily forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                let date = new Date(item.date);
                let options = { weekday: "long" };
                let dayName = date.toLocaleDateString("en-US", options);
                dayName = dayName.split(",")[0];

                return (
                  <View key={index} style={styles.view12}>
                    <Image
                      source={weatherImages[item?.day?.condition?.text]}
                      style={styles.img4}
                    />
                    <Text style={styles.text12}>{dayName}</Text>
                    <Text style={styles.text13}>{item?.day?.avgtemp_c}℃</Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  img: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  view1: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  safeView: {
    flex: 1,
  },
  view2: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  view3: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    marginRight: 10,
  },
  textIp: {
    flex: 1,
    color: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  touch: {
    padding: 10,
  },
  view4: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    marginTop: 10,
    maxHeight: 150,
    overflow: "hidden",
  },
  touch2: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "lightgray",
  },
  textt: {
    marginLeft: 10,
  },
  textCenter: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  textMain: {
    color: "white",
    fontSize: 20,
  },
  text2: {
    color: "gray",
  },
  view5: {
    marginTop: 10,
  },
  clodyimg: {
    width: 100,
    height: 100,
  },
  view6: {
    marginTop: 10,
  },
  text3: {
    fontSize: 28,
    color: "white",
  },
  text4: {
    color: "gray",
  },
  view7: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  view8: {
    flexDirection: "row",
    alignItems: "center",
  },
  img1: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  text5: {
    color: "white",
  },
  view9: {
    flexDirection: "row",
    alignItems: "center",
  },
  img2: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  text6: {
    color: "white",
  },
  img3: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  text10: {
    color: "white",
  },
  view10: {
    marginTop: 20,
  },
  view11: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  text11: {
    color: "white",
    marginLeft: 5,
    fontSize: 16,
  },
  view12: {
    marginRight: 15,
  },
  img4: {
    width: 50,
    height: 50,
  },
  text12: {
    color: "white",
    marginTop: 5,
    fontSize: 16,
  },
  text13: {
    color: "gray",
    marginTop: 5,
    fontSize: 14,
  },
});
