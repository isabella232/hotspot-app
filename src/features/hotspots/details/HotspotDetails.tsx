import React, { useEffect, useMemo, useState } from 'react'
import { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import animalName from 'angry-purple-tiger'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Hotspot } from '@helium/http'
import Box from '../../../components/Box'
import Text from '../../../components/Text'
import StatusBadge from './StatusBadge'
import TimelinePicker from './TimelinePicker'
import HotspotDetailChart from './HotspotDetailChart'
import { RootState } from '../../../store/rootReducer'
import { getRewardChartData } from './RewardsHelper'
import { useAppDispatch } from '../../../store/store'
import { fetchHotspotDetails } from '../../../store/hotspotDetails/hotspotDetailsSlice'
import HexBadge from './HexBadge'
import HotspotChecklist from '../checklist/HotspotChecklist'
import Address from '../../../components/Address'

const HotspotDetails = ({ hotspot }: { hotspot?: Hotspot }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const {
    hotspot: hotspotDetailsHotspot,
    numDays,
    rewards,
    rewardSum,
    rewardsChange,
    loading,
    witnessSums,
    witnessAverage,
    witnessChange,
    challengeSums,
    challengeSum,
    challengeChange,
    witnesses,
  } = useSelector((state: RootState) => state.hotspotDetails)
  const { account } = useSelector((state: RootState) => state.account)

  const rewardChartData = useMemo(() => {
    const data = getRewardChartData(rewards, numDays)
    return data || []
  }, [numDays, rewards])

  const [timelineValue, setTimelineValue] = useState(14)

  useEffect(() => {
    if (!hotspot) return

    dispatch(
      fetchHotspotDetails({ address: hotspot.address, numDays: timelineValue }),
    )
  }, [dispatch, hotspot, timelineValue])

  const witnessChartData = useMemo(() => {
    return (
      witnessSums?.map((w) => ({
        up: Math.round(w.avg),
        down: 0,
        label: w.timestamp,
        showTime: numDays === 1,
        id: `witness-${numDays}-${w.timestamp}`,
      })) || []
    )
  }, [numDays, witnessSums])

  const challengeChartData = useMemo(() => {
    return (
      challengeSums?.map((w) => ({
        up: Math.round(w.sum),
        down: 0,
        label: w.timestamp,
        showTime: numDays === 1,
        id: `challenge-${numDays}-${w.timestamp}`,
      })) || []
    )
  }, [numDays, challengeSums])

  if (!hotspot) return null

  return (
    <BottomSheetScrollView keyboardShouldPersistTaps="always">
      <Box paddingBottom="l">
        <Box
          marginBottom="m"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal="l"
        >
          <Text
            variant="h2"
            color="black"
            numberOfLines={1}
            adjustsFontSizeToFit
            flex={1}
          >
            {animalName(hotspot.address)}
          </Text>
        </Box>
        <Box
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          marginBottom="xl"
          paddingHorizontal="l"
        >
          <Box flexDirection="row" height={32}>
            {hotspot?.status || hotspotDetailsHotspot?.status ? (
              <StatusBadge
                online={
                  hotspot?.status?.online ||
                  hotspotDetailsHotspot?.status?.online
                }
              />
            ) : null}
            <HexBadge
              rewardScale={
                hotspot.rewardScale || hotspotDetailsHotspot?.rewardScale
              }
            />
          </Box>
          <Address
            address={hotspot.owner}
            ellipsizeMode="tail"
            variant="regular"
            text={
              hotspot.owner === account?.address
                ? t('hotspot_details.owner_you')
                : t('hotspot_details.owner', {
                    address: hotspot.owner,
                  })
            }
            maxWidth={128}
            color="grayLightText"
          />
        </Box>
        <HotspotChecklist hotspot={hotspot} witnesses={witnesses} />
        <TimelinePicker index={2} onTimelineChanged={setTimelineValue} />
        <HotspotDetailChart
          title={t('hotspot_details.reward_title')}
          number={rewardSum?.total.toFixed(2)}
          change={rewardsChange}
          data={rewardChartData}
          loading={loading}
        />
        <HotspotDetailChart
          title={t('hotspot_details.witness_title')}
          number={witnessAverage?.toFixed(0)}
          change={witnessChange}
          data={witnessChartData}
          loading={loading}
        />
        <HotspotDetailChart
          title={t('hotspot_details.challenge_title')}
          subTitle={t('hotspot_details.challenge_sub_title')}
          number={challengeSum?.toFixed(0)}
          change={challengeChange}
          data={challengeChartData}
          loading={loading}
        />
      </Box>
    </BottomSheetScrollView>
  )
}

export default HotspotDetails
