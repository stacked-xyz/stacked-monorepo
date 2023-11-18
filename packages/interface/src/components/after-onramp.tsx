'use client'

import { useParams, useSearchParams } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import React from 'react'
import { useRouter } from 'next/navigation'

export function AfterOnRamp() {
    const params = useSearchParams()
    const { push } = useRouter()
    const isRedirect: boolean = Boolean(params.get('isReturnUrl'))
    if (!isRedirect) {
        return null
    }
    return (<AlertDialog defaultOpen>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Success</AlertDialogTitle>
                <AlertDialogDescription>
                    You succesfully topped up your wallet!
                    Your funds will be available in your wallet in 5-10 minutes.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => { push("/") }}>Continue</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>)
}