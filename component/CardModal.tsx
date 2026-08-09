import { use, useEffect, useState } from "react"
import {
  View,
  StyleSheet,
  Modal,
  Text,
  FlatList,
  Pressable,
  TextInput,
} from "react-native"
import config from "../config/config"
import { SafeAreaView } from "react-native-safe-area-context"
import FuriganaSentence from "./FuriganaSentence"
import FuriganaButtonText from "./FuriganaButtonText"

type SubViewType = "NONE" | "ADD" | "EDIT" | "START"

type CardModalProps = {
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
  isVisible: boolean
  content: any
}

type Card = {
  id: string
  vocab: string
  kana: string
  english: string
  meaning: string
  sentence: string
  is_jukujikun: boolean
}

export default function CardModal(props: CardModalProps) {
  const { setVisible, isVisible, content } = props

  const [error, setError] = useState<any>()

  const [initialCardList, setInitialCardList] = useState<any>([])
  const [currentCardList, setCurrentCardList] = useState<any>([])

  const [activeSubView, setActiveSubView] = useState<SubViewType>("NONE")
  // const [selectedCard, setSelectedCard] = useState(1);
  const [cardSequence, setCardSequence] = useState<number[]>([])
  const [isShowKana, setIsShowKana] = useState<boolean>(false)
  const [isShowJukujikun, setIsShowJukujikun] = useState<boolean>(false)
  const [cardPosition, setCardPosition] = useState<number>(0)
  const [isShuffle, setIsShuffle] = useState<boolean>(false)
  const [isShowTranslation, setIsShowTranslation] = useState<boolean>(false)

  const [cardID, setCardID] = useState<string>("")
  const [cardFront, setCardFront] = useState<string>("")
  const [cardBack, setCardBack] = useState<string>("")
  const [cardNote, setCardNote] = useState<string>("")
  const [cardClass, setCardClass] = useState<string>("")

  const fetchCard = async () => {
    try {
      const response = await fetch(config.api_host + `/cards/${content.id}`)
      if (!response.ok) {
        const errorData = await response.json()
        const serverErrorMessage = errorData.message || "Something went wrong"
        throw new Error(serverErrorMessage)
      }
      const json = await response.json()
      setInitialCardList(json.data)
      setCurrentCardList(json.data)
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
        console.error("API Error:", err.message)
      } else {
        console.error("API Error: Unexpected error")
      }
    }
  }

  const updateCardHandler = async () => {
    try {
      if (!cardFront || !cardBack) {
        return alert("Missing Front & Back")
      }

      const payload = {
        front: cardFront,
        back: cardBack,
        note: cardNote,
        class: cardClass,
      }

      const response = await fetch(config.api_host + `/cards/${cardID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const updatedCardList = initialCardList.map((card: Card) => {
        if (card.id === cardID) {
          return {
            front: cardFront,
            back: cardBack,
            note: cardNote,
            class: cardClass,
            id: cardID,
          }
        }
        return card
      })

      setInitialCardList(updatedCardList)
      setCurrentCardList(updatedCardList)
      setActiveSubView("NONE")
    } catch (error) {
      console.error("Error making PUT request:", error)
    }
  }

  const addCardHandler = async () => {
    try {
      if (!cardFront || !cardBack) {
        return alert("Missing Front & Back")
      }

      const payload = {
        deck_id: content.id,
        front: cardFront,
        back: cardBack,
        note: cardNote,
        class: cardClass,
      }

      const response = await fetch(config.api_host + `/cards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const newCard = await response.json()
      const updatedCardList = [...initialCardList, newCard.data]

      setInitialCardList(updatedCardList)
      setCurrentCardList(updatedCardList)
      setActiveSubView("NONE")
    } catch (error) {
      console.error("Error making POST request:", error)
    }
  }

  const deleteCardHandler = async () => {
    try {
      const response = await fetch(config.api_host + `/cards/${cardID}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const updatedCardList = initialCardList.filter(
        (card: Card) => card.id !== cardID
      )

      setInitialCardList(updatedCardList)
      setCurrentCardList(updatedCardList)
      setActiveSubView("NONE")
    } catch (error) {
      console.error("Error making DELETE request:", error)
    }
  }

  useEffect(() => {
    if (content && isVisible) {
      fetchCard()
    }
  }, [content, isVisible])

  function generateShuffledSequence(length: any) {
    // 1. Create an array [0, 1, 2, ..., length - 1]
    const array = Array.from({ length }, (_, index) => index)

    // 2. Shuffle it using Fisher-Yates
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[array[i], array[j]] = [array[j], array[i]] // Swap
    }

    return array
  }

  const generateSequence = (length: number) => {
    if (isShuffle) {
      return generateShuffledSequence(length)
    } else {
      return Array.from({ length }, (_, index) => index)
    }
  }

  const addCardViewHandler = () => {
    setCardID("")
    setCardFront("")
    setCardBack("")
    setCardNote("")
    setCardClass("")
    setActiveSubView("ADD")
  }

  const editCardViewHandler = (card: Card) => {
    setCardID(card.id)
    // setCardFront(card.front)
    // setCardBack(card.back)
    // setCardNote(card.note)
    // setCardClass(card.class)
    setActiveSubView("EDIT")
  }

  const startHandler = () => {
    const length = currentCardList.length
    const seq = generateSequence(length)
    setCardSequence(seq)
    setCardPosition(0)
    setIsShowTranslation(false)
    setIsShowKana(false)
    setActiveSubView("START")
  }

  const nextCardHandler = () => {
    setIsShowKana(false)
    setIsShowTranslation(false)
    if (cardPosition < currentCardList.length - 1) {
      setCardPosition(cardPosition + 1)
    } else {
      setActiveSubView("NONE")
    }
  }

  const showKanaHandler = () => {
    setIsShowKana(!isShowKana)
  }

  const cardModeHandler = () => {
    setIsShuffle(!isShuffle)
  }

  const showTranslationHandler = () => {
    setIsShowTranslation(!isShowTranslation)
  }

  const showJukujikunHandler = () => {
    setIsShowJukujikun(!isShowJukujikun)
  }

  const closeViewHandler = () => {
    setActiveSubView("NONE")
  }

  const handleModalClose = () => {
    setVisible(!isVisible)
    setActiveSubView("NONE")
    setCurrentCardList([])
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => handleModalClose()}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={styles.cardContainer}>
          {currentCardList ? (
            <FlatList
              data={currentCardList}
              renderItem={({ item }: { item: Card }) => {
                return (
                  <Pressable
                    style={styles.cardItemContainer}
                    // onPress={() => editCardViewHandler(item)}
                  >
                    <View style={styles.cardItemContent}>
                      <Text>
                        {item.vocab} / {item.kana} ({item.meaning})
                      </Text>
                    </View>
                  </Pressable>
                )
              }}
            ></FlatList>
          ) : (
            <></>
          )}
        </View>
        {/**/}
        <View style={styles.actionContainer}>
          <Pressable
            style={styles.actionItemContainer}
            onPress={() => startHandler()}
          >
            <View style={styles.actionItemContent}>
              <Text>Start</Text>
            </View>
          </Pressable>
          {/* <Pressable */}
          {/*   style={styles.actionItemContainer} */}
          {/*   onPress={() => addCardViewHandler()} */}
          {/* > */}
          {/*   <View style={styles.actionItemContent}> */}
          {/*     <Text>Add Card</Text> */}
          {/*   </View> */}
          {/* </Pressable> */}
          <Pressable
            style={styles.actionItemContainer}
            onPress={() => cardModeHandler()}
          >
            <View style={styles.actionItemContent}>
              <Text>Mode: {isShuffle ? "Shuffled" : "Ordered"}</Text>
            </View>
          </Pressable>
        </View>

        {activeSubView === "START" && (
          <View style={styles.viewContainer}>
            <View style={styles.modalCardView}>
              <Text style={{ color: "red" }}>
                {isShowJukujikun &&
                currentCardList[cardSequence[cardPosition]]?.["is_jukujikun"]
                  ? "熟字訓"
                  : ""}
              </Text>
              <Text>
                {cardPosition + 1} / {currentCardList.length}
              </Text>
              <Text style={styles.cardKanjiText}>
                {currentCardList[cardSequence[cardPosition]]?.["vocab"] ??
                  "Loading..."}
              </Text>
              <Text style={styles.cardKanjiText}>
                {(isShowKana &&
                  currentCardList[cardSequence[cardPosition]]?.["kana"]) ??
                  "Loading..."}
              </Text>
              <Text style={styles.cardEnglishText}>
                {(isShowTranslation &&
                  currentCardList[cardSequence[cardPosition]]?.["meaning"]) ??
                  "Loading..."}
              </Text>
              <FuriganaSentence
                htmlString={
                  currentCardList[cardSequence[cardPosition]]?.["sentence"]
                }
              />
              <Text style={styles.cardEnglishText}>
                {(isShowTranslation &&
                  currentCardList[cardSequence[cardPosition]]?.["english"]) ??
                  "Loading..."}
              </Text>
            </View>
            <View style={styles.modalActionView}>
              <Pressable
                style={styles.actionItemContainer}
                onPress={() => showKanaHandler()}
              >
                <FuriganaButtonText htmlString="かな<ruby>表示<rt>ひょうじ</rt></ruby>" />
              </Pressable>
              <Pressable
                style={styles.actionItemContainer}
                onPress={() => showTranslationHandler()}
              >
                <FuriganaButtonText htmlString="<ruby>英語<rt>えいご</rt></ruby>を<ruby>表示<rt>ひょうじ</rt></ruby>" />
              </Pressable>
              <Pressable
                style={styles.actionItemContainer}
                onPress={() => showJukujikunHandler()}
              >
                <FuriganaButtonText htmlString="<ruby>熟字訓<rt>じゅくじくん</rt></ruby><ruby>表示<rt>ひょうじ</rt></ruby>" />
              </Pressable>
              <Pressable
                style={styles.actionItemContainer}
                onPress={() => nextCardHandler()}
              >
                <FuriganaButtonText htmlString="<ruby>次<rt>つぎ</rt></ruby>へ" />
              </Pressable>
            </View>
          </View>
        )}

        {activeSubView === "ADD" && (
          <View style={styles.viewContainer}>
            <View style={styles.modalCardView}>
              <Text>Add Card</Text>
              <Text></Text>
              <TextInput
                style={styles.textInput}
                placeholder="Front"
                placeholderTextColor="#999999"
                onChangeText={(text) => setCardFront(text)}
                value={cardFront}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Back"
                placeholderTextColor="#999999"
                onChangeText={(text) => setCardBack(text)}
                value={cardBack}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Note"
                placeholderTextColor="#999999"
                onChangeText={(text) => setCardNote(text)}
                value={cardNote}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Class"
                placeholderTextColor="#999999"
                onChangeText={(text) => setCardClass(text)}
                value={cardClass}
              />
            </View>

            <View style={styles.modalActionView}>
              <Pressable
                style={styles.actionItemContainer}
                onPress={() => addCardHandler()}
              >
                <View style={styles.actionItemContent}>
                  <Text>Add</Text>
                </View>
              </Pressable>
              <Pressable
                style={styles.actionItemContainer}
                onPress={() => closeViewHandler()}
              >
                <View style={styles.actionItemContent}>
                  <Text>Back</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}

        {activeSubView === "EDIT" && (
          <View style={styles.viewContainer}>
            <View style={styles.modalCardView}>
              <Text>Detail</Text>
              <Text></Text>
              <TextInput
                style={styles.textInput}
                placeholder="Front"
                placeholderTextColor="#999999"
                onChangeText={(text) => setCardFront(text)}
                value={cardFront}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Back"
                placeholderTextColor="#999999"
                onChangeText={(text) => setCardBack(text)}
                value={cardBack}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Note"
                placeholderTextColor="#999999"
                onChangeText={(text) => setCardNote(text)}
                value={cardNote}
              />
              <TextInput
                style={styles.textInput}
                placeholder="Class"
                placeholderTextColor="#999999"
                onChangeText={(text) => setCardClass(text)}
                value={cardClass}
              />
            </View>
            <View style={styles.modalActionView}>
              <Pressable
                style={styles.actionItemContainer}
                onPress={() => updateCardHandler()}
              >
                <View style={styles.actionItemContent}>
                  <Text>Update</Text>
                </View>
              </Pressable>
              <Pressable
                style={styles.actionItemContainer}
                onPress={() => deleteCardHandler()}
              >
                <View style={styles.actionItemContent}>
                  <Text>Delete</Text>
                </View>
              </Pressable>
              <Pressable
                style={styles.actionItemContainer}
                onPress={() => closeViewHandler()}
              >
                <View style={styles.actionItemContent}>
                  <Text>Back</Text>
                </View>
              </Pressable>
            </View>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  viewContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white", // Solid background hides base list view cleanly
    paddingVertical: 30,
    padding: 15,
    // borderTopWidth: 1,
    // borderColor: "#cccccc",
  },
  cardContainer: {
    flex: 6,
    paddingVertical: 30,
    padding: 15,
    flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#cccccc",
    justifyContent: "center",
    width: "100%",
    backgroundColor: "white",
  },
  actionContainer: {
    flex: 4,
    paddingVertical: 30,
    padding: 15,
    // flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#cccccc",
    justifyContent: "flex-start",
    width: "100%",
    backgroundColor: "white",
  },
  actionItemContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 10,
    marginBottom: 20,
    height: 50,
  },
  actionItemContent: {
    padding: 10,
  },
  cardItemContainer: {
    flex: 1,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 10,
    marginBottom: 20,
    height: 50,
  },
  cardItemContent: {
    width: "70%",
    padding: 10,
  },
  textInput: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    borderRadius: 3,
    width: "90%",
    marginRight: 8,
    color: "#000000",
    padding: 8,
  },
  modalCardView: {
    flex: 6,
    borderTopWidth: 1,
    borderColor: "#cccccc",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    backgroundColor: "white",
  },
  modalActionView: {
    flex: 4,
    paddingVertical: 30,
    padding: 15,
    // flexDirection: "row",
    borderTopWidth: 1,
    borderColor: "#cccccc",
    justifyContent: "flex-start",
    width: "100%",
    backgroundColor: "white",
  },
  cardKanjiText: {
    fontSize: 25,
  },
  cardEnglishText: {
    fontSize: 20,
  },
  // alignItems: "center",
  // justifyContent: "center",
})
