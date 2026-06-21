import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View, Pressable } from "react-native";
import config from "../config/config";
import CardListModal from "../component/CardModal";

export default function DeckScreen() {
    const [deckList, setDeckList] = useState<any>([]);
    const [error, setError] = useState<any>();
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<any>([]);

    const fetchDeck = async () => {
        try {
            const response = await fetch(config.api_host + "/decks");
            if (!response.ok) {
                const errorData = await response.json();
                const serverErrorMessage = errorData.message || "Something went wrong";
                throw new Error(serverErrorMessage);
            }
            const json = await response.json();
            setDeckList(json.data);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
                console.error("API Error:", err.message);
            } else {
                console.error("API Error: Unexpected error");
            }
        }
    };

    useEffect(() => {
        fetchDeck();
    }, []);

    const deckOnPressHandler = (content: any) => {
        setModalContent(content);
        setModalVisible(!modalVisible);
    };

    return (
        <View style={styles.mainContainer}>
            <CardListModal
                setVisible={setModalVisible}
                isVisible={modalVisible}
                content={modalContent}
            />
            <View style={styles.deckContainer}>
                {deckList ? (
                    <FlatList
                        data={deckList}
                        renderItem={({ item }) => {
                            return (
                                <Pressable onPress={() => deckOnPressHandler(item)}>
                                    <View style={styles.deckItem}>
                                        <View style={styles.deckItemContent}>
                                            <Text>{item.name}</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        }}
                    ></FlatList>
                ) : (
                    <></>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 100,
        paddingHorizontal: 15,
    },
    deckContainer: {
        flex: 9,
        flexDirection: "row",
        justifyContent: "center",
    },
    deckItem: {
        flex: 1,
        flexDirection: "row",
        borderWidth: 1,
        borderColor: "#cccccc",
        borderRadius: 10,
        marginBottom: 20,
        height: 50,
    },
    deckItemContent: {
        width: "70%",
        padding: 10,
    },
    // alignItems: "center",
    // justifyContent: "center",
});
